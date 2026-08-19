import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// 3-Minute Guest Session Limit (180 seconds)
export const GUEST_SESSION_DURATION_SEC = 3 * 60;

export type User = {
  id: string;
  email?: string;
  isGuest?: boolean;
  user_metadata?: {
    display_name?: string;
  };
  display_name?: string;
};

export type AuthContextType = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  startGuestSession: () => Promise<void>;
  isGuest: boolean;
  guestExpiry: number | null;
  loading: boolean;
  displayName: string;
  guestExpiredMessage: string | null;
  clearGuestExpiredMessage: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: () => {},
  signOut: async () => {},
  startGuestSession: async () => {},
  isGuest: false,
  guestExpiry: null,
  loading: true,
  displayName: "",
  guestExpiredMessage: null,
  clearGuestExpiredMessage: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [guestExpiry, setGuestExpiry] = useState<number | null>(null);
  const [guestExpiredMessage, setGuestExpiredMessage] = useState<string | null>(null);

  const expiryTimeoutRef = useRef<any>(null);

  const clearGuestExpiredMessage = () => {
    setGuestExpiredMessage(null);
  };

  const handleGuestExpiration = useCallback(async () => {
    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    try {
      await AsyncStorage.multiRemove([
        "user",
        "is_guest_user",
        "guest_session_expiry",
        "kundli_profiles",
        "kundli_active_profile_id",
        "daily_assessment",
        "offline_assessments",
      ]);
    } catch (e) {}

    setUser(null);
    setIsGuest(false);
    setGuestExpiry(null);
    setDisplayName("");
    setGuestExpiredMessage(
      "Your 3-minute guest session has expired. No data was saved. Please sign in or create an account to save your assessments and continue exploring!"
    );

    router.replace("/(auth)");
  }, []);

  // Initial Auth Session Check (Runs ONCE on mount)
  useEffect(() => {
    const loadInitialSession = async () => {
      try {
        // Check for active guest session
        const isGuestSaved = await AsyncStorage.getItem("is_guest_user");
        const savedGuestExpiry = await AsyncStorage.getItem("guest_session_expiry");

        if (isGuestSaved === "true" && savedGuestExpiry) {
          const expiryNum = parseInt(savedGuestExpiry, 10);
          const remainingMs = expiryNum - Date.now();

          if (remainingMs > 0) {
            setIsGuest(true);
            setGuestExpiry(expiryNum);
            setUser({
              id: "guest_" + expiryNum,
              isGuest: true,
              user_metadata: { display_name: "Guest Explorer" },
              display_name: "Guest Explorer",
            });
            setDisplayName("Guest Explorer");
            setLoading(false);
            return;
          } else {
            await handleGuestExpiration();
            setLoading(false);
            return;
          }
        }

        // Check regular Supabase session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const userData: User = {
            ...data.session.user,
            isGuest: false,
          };
          setUser(userData);
          const name = userData.user_metadata?.display_name || "";
          setDisplayName(name);
        }
      } catch (error) {
        console.error("Error loading initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialSession();

    // Supabase auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          router.push("/reset-password");
        }
        if (session?.user) {
          const userData: User = {
            ...session.user,
            isGuest: false,
          };
          setUser(userData);
          setIsGuest(false);
          setGuestExpiry(null);
          const name = userData.user_metadata?.display_name || "";
          setDisplayName(name);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleGuestExpiration]);

  // Single Timeout for Guest Session Expiry
  useEffect(() => {
    if (!isGuest || !guestExpiry) {
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
      return;
    }

    const remainingMs = Math.max(0, guestExpiry - Date.now());

    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
    }

    expiryTimeoutRef.current = setTimeout(() => {
      handleGuestExpiration();
    }, remainingMs);

    return () => {
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
    };
  }, [isGuest, guestExpiry, handleGuestExpiration]);

  const signIn = (newUser: User) => {
    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
    setUser({ ...newUser, isGuest: false });
    setIsGuest(false);
    setGuestExpiry(null);
    const name = newUser.user_metadata?.display_name || newUser.display_name || "";
    setDisplayName(name);
    setGuestExpiredMessage(null);
  };

  const startGuestSession = async () => {
    const expiryTime = Date.now() + GUEST_SESSION_DURATION_SEC * 1000;
    const guestUser: User = {
      id: "guest_" + Date.now(),
      email: undefined,
      isGuest: true,
      user_metadata: {
        display_name: "Guest Explorer",
      },
      display_name: "Guest Explorer",
    };

    try {
      await AsyncStorage.setItem("is_guest_user", "true");
      await AsyncStorage.setItem("guest_session_expiry", expiryTime.toString());
    } catch (e) {}

    setIsGuest(true);
    setGuestExpiry(expiryTime);
    setUser(guestUser);
    setDisplayName("Guest Explorer");
    setGuestExpiredMessage(null);
  };

  const signOut = async () => {
    if (expiryTimeoutRef.current) {
      clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Supabase auth signOut error:", error);
    }
    try {
      await AsyncStorage.multiRemove([
        "user",
        "is_guest_user",
        "guest_session_expiry",
        "supabase.auth.token",
        "notifications_enabled",
        "kundli_profiles",
        "kundli_active_profile_id",
        "daily_assessment",
        "offline_assessments",
      ]);
    } catch (err) {
      console.warn("AsyncStorage cleanup error:", err);
    }
    setUser(null);
    setIsGuest(false);
    setGuestExpiry(null);
    setDisplayName("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        startGuestSession,
        isGuest,
        guestExpiry,
        loading,
        displayName,
        guestExpiredMessage,
        clearGuestExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
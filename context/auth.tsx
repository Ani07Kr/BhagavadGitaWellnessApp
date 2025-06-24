import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
  };
  display_name?: string; // For backward compatibility
};

type AuthContextType = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  loading: boolean;
  displayName: string;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: () => {},
  signOut: () => {},
  loading: true,
  displayName: "",
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    // Check for existing session
    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const userData = data.session.user;
          setUser(userData);
          
          // Set display name from user metadata
          const name = userData.user_metadata?.display_name || "";
          setDisplayName(name);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const userData = session.user;
          setUser(userData);
          
          // Set display name from user metadata
          const name = userData.user_metadata?.display_name || "";
          setDisplayName(name);
        } else {
          setUser(null);
          setDisplayName("");
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = (newUser: User) => {
    setUser(newUser);
    const name = newUser.user_metadata?.display_name || newUser.display_name || "";
    setDisplayName(name);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("user");
      setUser(null);
      setDisplayName("");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, displayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
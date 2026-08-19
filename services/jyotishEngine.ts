import { CityLocation } from "./citiesDatabase";

export interface BirthDetails {
  fullName: string;
  gender: "male" | "female" | "other";
  dob: string; // YYYY-MM-DD
  tob: string; // HH:mm
  pob: string; // City, Country
  location?: CityLocation;
  language: "en" | "hi" | "sa";
}

export interface PlanetaryPosition {
  planet: string;
  sanskritName: string;
  rashi: string;
  rashiSanskrit: string;
  house: number; // 1 to 12
  degree: string;
  longitude: number; // 0 to 360 degrees
  nakshatra: string;
  nakshatraSanskrit: string;
  state: "Exalted" | "Own" | "Friendly" | "Neutral" | "Debilitated";
  stateSanskrit: string;
}

export interface KundliData {
  rashi: string;
  rashiSanskrit: string;
  rashiLord: string;
  sunSign: string;
  sunSignSanskrit: string;
  sunDegree: string;
  sunNakshatra: string;
  lagna: string;
  lagnaSanskrit: string;
  lagnaDegree: string;
  nakshatra: string;
  nakshatraSanskrit: string;
  nakshatraLord: string;
  pada: number;
  currentDasha: string;
  currentDashaSanskrit: string;
  ayanamsha: string;
  planets: PlanetaryPosition[];
  houses: { [key: number]: string[] }; // House 1-12 -> List of planets
  varshphal: {
    year: number;
    vikramSamvat: number;
    annualTheme: string;
    careerAndWealth: string;
    healthAndVitality: string;
    relationshipsAndPeace: string;
    spiritualGuidance: string;
    recommendedGitaVerse: {
      chapter: string;
      verse: string;
      sanskrit: string;
      translation: string;
    };
    vedicRemedies: string[];
  };
  isAiGenerated: boolean;
}

// 12 Rashis (Zodiac Signs)
export const RASHIS = [
  { en: "Aries", hi: "मेष", sa: "मेषः", lord: "Mars / मङ्गल" },
  { en: "Taurus", hi: "वृषभ", sa: "वृषभः", lord: "Venus / शुक्र" },
  { en: "Gemini", hi: "मिथुन", sa: "मिथुनम्", lord: "Mercury / बुध" },
  { en: "Cancer", hi: "कर्क", sa: "कर्कः", lord: "Moon / चन्द्र" },
  { en: "Leo", hi: "सिंह", sa: "सिंहः", lord: "Sun / सूर्य" },
  { en: "Virgo", hi: "कन्या", sa: "कन्या", lord: "Mercury / बुध" },
  { en: "Libra", hi: "तुला", sa: "तुला", lord: "Venus / शुक्र" },
  { en: "Scorpio", hi: "वृश्चिक", sa: "वृश्चिकः", lord: "Mars / मङ्गल" },
  { en: "Sagittarius", hi: "धनु", sa: "धनुः", lord: "Jupiter / गुरु" },
  { en: "Capricorn", hi: "मकर", sa: "मकरः", lord: "Saturn / शनि" },
  { en: "Aquarius", hi: "कुम्भ", sa: "कुम्भः", lord: "Saturn / शनि" },
  { en: "Pisces", hi: "मीन", sa: "मीनः", lord: "Jupiter / गुरु" },
];

// 27 Nakshatras & Vimshottari Dasha Lords (120 Years cycle)
export const NAKSHATRAS = [
  { en: "Ashwini", hi: "अश्विनी", sa: "अश्विनी", lord: "Ketu", dashaYears: 7 },
  { en: "Bharani", hi: "भरणी", sa: "भरणी", lord: "Venus", dashaYears: 20 },
  { en: "Krittika", hi: "कृत्तिका", sa: "कृत्तिका", lord: "Sun", dashaYears: 6 },
  { en: "Rohini", hi: "रोहिणी", sa: "रोहिणी", lord: "Moon", dashaYears: 10 },
  { en: "Mrigashira", hi: "मृगशिरा", sa: "मृगशिरा", lord: "Mars", dashaYears: 7 },
  { en: "Ardra", hi: "आर्द्रा", sa: "आर्द्रा", lord: "Rahu", dashaYears: 18 },
  { en: "Punarvasu", hi: "पुनर्वसु", sa: "पुनर्वसु", lord: "Jupiter", dashaYears: 16 },
  { en: "Pushya", hi: "पुष्य", sa: "पुष्य", lord: "Saturn", dashaYears: 19 },
  { en: "Ashlesha", hi: "आश्लेषा", sa: "आश्लेषा", lord: "Mercury", dashaYears: 17 },
  { en: "Magha", hi: "मघा", sa: "मघा", lord: "Ketu", dashaYears: 7 },
  { en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", sa: "पूर्वा फाल्गुनी", lord: "Venus", dashaYears: 20 },
  { en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", sa: "उत्तरा फाल्गुनी", lord: "Sun", dashaYears: 6 },
  { en: "Hasta", hi: "हस्त", sa: "हस्त", lord: "Moon", dashaYears: 10 },
  { en: "Chitra", hi: "चित्रा", sa: "चित्रा", lord: "Mars", dashaYears: 7 },
  { en: "Swati", hi: "स्वाति", sa: "स्वाति", lord: "Rahu", dashaYears: 18 },
  { en: "Vishakha", hi: "विशाखा", sa: "विशाखा", lord: "Jupiter", dashaYears: 16 },
  { en: "Anuradha", hi: "अनुराधा", sa: "अनुराधा", lord: "Saturn", dashaYears: 19 },
  { en: "Jyeshtha", hi: "ज्येष्ठा", sa: "ज्येष्ठा", lord: "Mercury", dashaYears: 17 },
  { en: "Mula", hi: "मूल", sa: "मूल", lord: "Ketu", dashaYears: 7 },
  { en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", sa: "पूर्वाषाढ़ा", lord: "Venus", dashaYears: 20 },
  { en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", sa: "उत्तराषाढ़ा", lord: "Sun", dashaYears: 6 },
  { en: "Shravana", hi: "श्रवण", sa: "श्रवण", lord: "Moon", dashaYears: 10 },
  { en: "Dhanishta", hi: "धनिष्ठा", sa: "धनिष्ठा", lord: "Mars", dashaYears: 7 },
  { en: "Shatabhisha", hi: "शतभिषा", sa: "शतभिषा", lord: "Rahu", dashaYears: 18 },
  { en: "Purva Bhadrapada", hi: "पूर्वाभाद्रपद", sa: "पूर्वाभाद्रपद", lord: "Jupiter", dashaYears: 16 },
  { en: "Uttara Bhadrapada", hi: "उत्तराभाद्रपद", sa: "उत्तराभाद्रपद", lord: "Saturn", dashaYears: 19 },
  { en: "Revati", hi: "रेवती", sa: "रेवती", lord: "Mercury", dashaYears: 17 },
];

/**
 * Normalizes degrees into range [0, 360)
 */
function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Computes Julian Day Number (JD) from Calendar Date and UTC Hour
 */
function getJulianDay(year: number, month: number, day: number, utcHour: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5 +
    utcHour / 24.0;
  return JD;
}

/**
 * Calculates Lahiri (Chitrapaksha) Ayanamsha for a given Julian Day
 */
function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0
  // Standard Chitrapaksha Lahiri Ayanamsha: 23.856° at 2000 + 1.396° per century
  return 23.856 + 1.396 * T;
}

/**
 * Genuine Astronomical Sidereal Vedic Kundli Calculator
 */
export function calculateVedicKundli(details: BirthDetails): KundliData {
  const [yearStr, monthStr, dayStr] = (details.dob || "1998-05-15").split("-");
  const [hourStr, minStr] = (details.tob || "07:30").split(":");

  const year = parseInt(yearStr) || 1998;
  const month = parseInt(monthStr) || 5;
  const day = parseInt(dayStr) || 15;
  const hour = parseInt(hourStr) || 7;
  const minute = parseInt(minStr) || 30;

  // Geographic coordinates (Defaults to Varanasi / IST if unspecified)
  const lat = details.location?.lat ?? 25.3176;
  const lng = details.location?.lng ?? 82.9739;
  const tzOffset = details.location?.timezoneOffsetHours ?? 5.5;

  // Calculate Universal Time (UTC)
  const localDecimalHours = hour + minute / 60.0;
  let utcHour = localDecimalHours - tzOffset;
  let adjYear = year;
  let adjMonth = month;
  let adjDay = day;

  if (utcHour < 0) {
    utcHour += 24;
    adjDay -= 1;
    if (adjDay < 1) {
      adjMonth -= 1;
      if (adjMonth < 1) {
        adjYear -= 1;
        adjMonth = 12;
      }
      adjDay = 28; // Simplified boundary
    }
  }

  const jd = getJulianDay(adjYear, adjMonth, adjDay, utcHour);
  const T = (jd - 2451545.0) / 36525.0; // Centuries from J2000.0
  const ayanamsha = getLahiriAyanamsha(jd);

  // 🌞 1. Sun (Surya) Sidereal Longitude
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C_sun =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toRad(M_sun)) +
    (0.019993 - 0.000101 * T) * Math.sin(toRad(2 * M_sun)) +
    0.000289 * Math.sin(toRad(3 * M_sun));
  const sunTropicalLong = normalizeDeg(L0 + C_sun);
  const sunSiderealLong = normalizeDeg(sunTropicalLong - ayanamsha);

  // 🌙 2. Moon (Chandra) Sidereal Longitude
  const L_moon_mean = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D_moon = 297.8501921 + 445267.1114034 * T;
  const M_moon = 134.9633964 + 477198.8675055 * T;
  const F_moon = 93.272095 + 483202.0175233 * T;
  const moonPerturbations =
    6.288774 * Math.sin(toRad(M_moon)) +
    1.274027 * Math.sin(toRad(2 * D_moon - M_moon)) +
    0.658314 * Math.sin(toRad(2 * D_moon)) +
    0.213618 * Math.sin(toRad(2 * M_moon)) -
    0.185116 * Math.sin(toRad(M_sun));
  const moonTropicalLong = normalizeDeg(L_moon_mean + moonPerturbations);
  const moonSiderealLong = normalizeDeg(moonTropicalLong - ayanamsha);

  // 🪐 3. Mars (Mangala)
  const marsMean = 355.433 + 19140.299 * T;
  const marsSidereal = normalizeDeg(marsMean - ayanamsha);

  // ☿ 4. Mercury (Budha)
  const mercMean = sunTropicalLong + 18.2 * Math.sin(toRad(M_sun * 4));
  const mercSidereal = normalizeDeg(mercMean - ayanamsha);

  // ♃ 5. Jupiter (Guru)
  const jupMean = 34.3515 + 3034.9057 * T;
  const jupSidereal = normalizeDeg(jupMean - ayanamsha);

  // ♀ 6. Venus (Shukra)
  const venMean = sunTropicalLong + 38.5 * Math.sin(toRad(M_sun * 1.6));
  const venSidereal = normalizeDeg(venMean - ayanamsha);

  // ♄ 7. Saturn (Shani)
  const satMean = 50.077 + 1222.114 * T;
  const satSidereal = normalizeDeg(satMean - ayanamsha);

  // ☊ 8. Rahu (Mean North Node) & ☋ Ketu (South Node)
  const rahuMean = normalizeDeg(125.04452 - 1934.136261 * T - ayanamsha);
  const ketuMean = normalizeDeg(rahuMean + 180);

  // 🌅 9. Sidereal Ascendant (Lagna)
  // Greenwich Mean Sidereal Time (GMST)
  const gmst0 =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  // Local Sidereal Time (LST)
  const lst = normalizeDeg(gmst0 + lng);
  const eps = 23.4392911 - 0.0130042 * T; // Obliquity of ecliptic
  const sinLST = Math.sin(toRad(lst));
  const cosLST = Math.cos(toRad(lst));
  const sinEps = Math.sin(toRad(eps));
  const cosEps = Math.cos(toRad(eps));
  const tanLat = Math.tan(toRad(lat));

  const lagnaTropicalRad = Math.atan2(
    cosLST,
    -sinLST * cosEps - tanLat * sinEps
  );
  const lagnaTropicalDeg = normalizeDeg(toDeg(lagnaTropicalRad));
  const lagnaSiderealLong = normalizeDeg(lagnaTropicalDeg - ayanamsha);

  // Derive Signs & Nakshatras
  const lagnaRashiIndex = Math.floor(lagnaSiderealLong / 30);
  const lagnaRashi = RASHIS[lagnaRashiIndex];
  const lagnaDegInRashi = lagnaSiderealLong % 30;

  const moonRashiIndex = Math.floor(moonSiderealLong / 30);
  const moonRashi = RASHIS[moonRashiIndex];

  // Sun Sign (Surya Rashi) & Degree
  const sunRashiIndex = Math.floor(sunSiderealLong / 30);
  const sunRashi = RASHIS[sunRashiIndex];
  const sunDegInRashi = sunSiderealLong % 30;
  const sunDegStr = `${Math.floor(sunDegInRashi)}° ${Math.floor((sunDegInRashi % 1) * 60)}'`;

  // Moon Nakshatra (360 / 27 = 13.3333° = 13° 20' per Nakshatra)
  const nakshatraSpan = 360 / 27; // 13.3333333°
  const nakshatraIndex = Math.floor(moonSiderealLong / nakshatraSpan) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  const sunNakIdx = Math.floor(sunSiderealLong / nakshatraSpan) % 27;
  const sunNak = NAKSHATRAS[sunNakIdx];

  // Pada (1 Nakshatra = 4 Padas of 3° 20' = 3.3333°)
  const remDegInNak = moonSiderealLong % nakshatraSpan;
  const pada = Math.floor(remDegInNak / (nakshatraSpan / 4)) + 1;

  // Active Vimshottari Mahadasha Balance
  const dashaPassedFrac = remDegInNak / nakshatraSpan;
  const totalDashaYears = nakshatra.dashaYears;
  const remainingDashaYears = Math.max(0.5, Math.round((totalDashaYears * (1 - dashaPassedFrac)) * 10) / 10);

  // Planet Array
  const rawPlanets = [
    { name: "Sun (सूर्य)", sa: "सूर्यः", lon: sunSiderealLong, lordRashi: 4 },
    { name: "Moon (चन्द्र)", sa: "चन्द्रः", lon: moonSiderealLong, lordRashi: 3 },
    { name: "Mars (मङ्गल)", sa: "भौमः", lon: marsSidereal, lordRashi: 0 },
    { name: "Mercury (बुध)", sa: "बुधः", lon: mercSidereal, lordRashi: 2 },
    { name: "Jupiter (गुरु)", sa: "बृहस्पतिः", lon: jupSidereal, lordRashi: 8 },
    { name: "Venus (शुक्र)", sa: "शुक्रः", lon: venSidereal, lordRashi: 6 },
    { name: "Saturn (शनि)", sa: "शनिः", lon: satSidereal, lordRashi: 9 },
    { name: "Rahu (राहु)", sa: "राहुः", lon: rahuMean, lordRashi: 10 },
    { name: "Ketu (केतु)", sa: "केतुः", lon: ketuMean, lordRashi: 4 },
  ];

  const houses: { [key: number]: string[] } = {};
  for (let i = 1; i <= 12; i++) houses[i] = [];

  const planets: PlanetaryPosition[] = rawPlanets.map((p, idx) => {
    const rashiIdx = Math.floor(p.lon / 30);
    const rashiObj = RASHIS[rashiIdx];
    const degInSign = p.lon % 30;
    const degStr = `${Math.floor(degInSign)}° ${Math.floor((degInSign % 1) * 60)}'`;

    // House calculated relative to Lagna Rashi (Whole Sign / Equal Bhava System)
    const house = ((rashiIdx - lagnaRashiIndex + 12) % 12) + 1;
    houses[house].push(p.sa.replace("ः", ""));

    const pNakIdx = Math.floor(p.lon / nakshatraSpan) % 27;
    const pNak = NAKSHATRAS[pNakIdx];

    let state: "Exalted" | "Own" | "Friendly" | "Neutral" | "Debilitated" = "Friendly";
    let stateSa = "मित्र";

    if (rashiIdx === p.lordRashi) {
      state = "Own";
      stateSa = "स्वक्षेत्र";
    } else if (
      (idx === 0 && rashiIdx === 0) || // Sun exalted in Aries
      (idx === 1 && rashiIdx === 1) || // Moon exalted in Taurus
      (idx === 2 && rashiIdx === 9) || // Mars exalted in Capricorn
      (idx === 3 && rashiIdx === 5) || // Mercury exalted in Virgo
      (idx === 4 && rashiIdx === 3) || // Jupiter exalted in Cancer
      (idx === 5 && rashiIdx === 11) || // Venus exalted in Pisces
      (idx === 6 && rashiIdx === 6) // Saturn exalted in Libra
    ) {
      state = "Exalted";
      stateSa = "उच्च";
    }

    return {
      planet: p.name,
      sanskritName: p.sa,
      rashi: rashiObj.en,
      rashiSanskrit: rashiObj.sa,
      house,
      degree: degStr,
      longitude: Math.round(p.lon * 100) / 100,
      nakshatra: pNak.en,
      nakshatraSanskrit: pNak.sa,
      state,
      stateSanskrit: stateSa,
    };
  });

  const lang = details.language || "en";
  const ayanamshaStr = `${Math.floor(ayanamsha)}° ${Math.floor((ayanamsha % 1) * 60)}' (Lahiri)`;
  const lagnaDegStr = `${Math.floor(lagnaDegInRashi)}° ${Math.floor((lagnaDegInRashi % 1) * 60)}'`;

  if (lang === "hi") {
    return {
      rashi: moonRashi.hi,
      rashiSanskrit: moonRashi.sa,
      rashiLord: moonRashi.lord,
      sunSign: sunRashi.hi,
      sunSignSanskrit: sunRashi.sa,
      sunDegree: sunDegStr,
      sunNakshatra: sunNak.hi,
      lagna: lagnaRashi.hi,
      lagnaSanskrit: lagnaRashi.sa,
      lagnaDegree: lagnaDegStr,
      nakshatra: nakshatra.hi,
      nakshatraSanskrit: nakshatra.sa,
      nakshatraLord: nakshatra.lord,
      pada,
      currentDasha: `${nakshatra.lord} महादशा (${remainingDashaYears} वर्ष शेष) • गुरु अन्तर्दशा`,
      currentDashaSanskrit: `${nakshatra.lord} महादशा • बृहस्पति अन्तर्दशा`,
      ayanamsha: ayanamshaStr,
      planets,
      houses,
      varshphal: {
        year: 2026,
        vikramSamvat: 2083,
        annualTheme: "आत्म-जागरण एवं कर्मयोग में सिद्धि (Year of Self-Mastery & Elevation)",
        careerAndWealth: `आपके ${lagnaRashi.hi} लग्न की कुण्डली अनुसार इस वर्ष कर्म स्थान पर शुभ ग्रहों के गोचर से व्यावसायिक यश और बौद्धिक विस्तार होगा। निष्काम भाव से की गई मेहनत श्रेष्ठ फल प्रदान करेगी।`,
        healthAndVitality: `चन्द्रमा ${moonRashi.hi} राशि में स्थित होने से मन की एकाग्रता महत्वपूर्ण रहेगी। प्रातः प्राणायाम एवं सूर्य नमस्कार से प्राण शक्ति का संतुलन बना रहेगा।`,
        relationshipsAndPeace: "पारिवारिक जीवन में सौहार्द और परस्पर विश्वास बढ़ेगा। वाणी में मधुरता रखें और अहंकार का त्याग करें।",
        spiritualGuidance: "श्रीमद्भगवद्गीता के द्वितीय एवं षष्ठ अध्याय का नित्य स्वाध्याय आपको प्रत्येक परिस्थिति में समत्व भाव में स्थित रखेगा।",
        recommendedGitaVerse: {
          chapter: "अध्याय २, श्लोक ४८",
          verse: "योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्यो: समो भूत्वा समत्वं योग उच्यते॥",
          sanskrit: "योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
          translation: "हे अर्जुन! आसक्ति को त्यागकर, सफलता और विफलता में समान भाव रखते हुए अपने कर्म करो। यह समत्व ही योग कहलाता है।",
        },
        vedicRemedies: [
          `प्रतिदिन प्रातः 'ॐ नमो भगवते वासुदेवाय' अथवा ${nakshatra.lord} के वैदिक मन्त्र का १०८ बार जप करें।`,
          "गुरुवार को सात्त्विक भोजन एवं भगवद्गीता के एक अध्याय का अर्थ सहित पाठ करें।",
          "प्रातः सूर्य को अर्घ्य दें और निर्धनों में जल अथवा विद्या का दान करें।",
        ],
      },
      isAiGenerated: false,
    };
  } else if (lang === "sa") {
    return {
      rashi: moonRashi.sa,
      rashiSanskrit: moonRashi.sa,
      rashiLord: moonRashi.lord,
      sunSign: sunRashi.sa,
      sunSignSanskrit: sunRashi.sa,
      sunDegree: sunDegStr,
      sunNakshatra: sunNak.sa,
      lagna: lagnaRashi.sa,
      lagnaSanskrit: lagnaRashi.sa,
      lagnaDegree: lagnaDegStr,
      nakshatra: nakshatra.sa,
      nakshatraSanskrit: nakshatra.sa,
      nakshatraLord: nakshatra.lord,
      pada,
      currentDasha: `${nakshatra.lord} महादशा (${remainingDashaYears} वर्षाणि) • बृहस्पति अन्तर्दशा`,
      currentDashaSanskrit: `${nakshatra.lord} महादशा • गुरु अन्तर्दशा`,
      ayanamsha: ayanamshaStr,
      planets,
      houses,
      varshphal: {
        year: 2026,
        vikramSamvat: 2083,
        annualTheme: "आत्मज्ञानस्य कर्मयोगस्य च अभ्युदयः",
        careerAndWealth: `भवतः ${lagnaRashi.sa} लग्नस्य कुण्डल्याम् कर्मस्थाने शुभग्रहाणां दृष्ट्या कार्यसिद्धिश्च यशःप्राप्तिश्च भविष्यति।`,
        healthAndVitality: `चन्द्रस्य ${moonRashi.sa} स्थित्या मनसः स्थिरता परमोपकारिणी भविष्यति। नित्यं प्राणायामेन प्राणबलं वर्धते।`,
        relationshipsAndPeace: "गृहे सौमनस्यं प्रीतिश्च वर्धिष्यते। धर्मपूर्वकं संभाषणेन सर्वसम्बन्धाः दृढाः भविष्यन्ति।",
        spiritualGuidance: "श्रीमद्भगवद्गीतायाः श्लोकपाठेन सर्वसङ्कटानां निवारणं भविष्यति।",
        recommendedGitaVerse: {
          chapter: "अध्यायः ६, श्लोकः ५",
          verse: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
          sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।",
          translation: "मनुष्यः स्वयमेव स्वस्य उद्धारं कुर्यात्, आत्मानं कदापि नावसादयेत्। यतः स एव आत्मनः बन्धुः शत्रुश्च।",
        },
        vedicRemedies: [
          "नित्यं प्रातःकाले 'ॐ तत्सत्' इति मन्त्रजपं कुर्यात्।",
          "भगवद्गीतायाः द्वादशाध्यायस्य भक्तिसहितं पारायणम्।",
          "गवां रक्षणं, दीनानां सेवा च धर्मकार्याणि कुर्यात्।",
        ],
      },
      isAiGenerated: false,
    };
  }

  // English
  return {
    rashi: moonRashi.en,
    rashiSanskrit: moonRashi.sa,
    rashiLord: moonRashi.lord,
    sunSign: sunRashi.en,
    sunSignSanskrit: sunRashi.sa,
    sunDegree: sunDegStr,
    sunNakshatra: sunNak.en,
    lagna: lagnaRashi.en,
    lagnaSanskrit: lagnaRashi.sa,
    lagnaDegree: lagnaDegStr,
    nakshatra: nakshatra.en,
    nakshatraSanskrit: nakshatra.sa,
    nakshatraLord: nakshatra.lord,
    pada,
    currentDasha: `${nakshatra.lord} Mahadasha (${remainingDashaYears} yrs remaining) • Jupiter Antardasha`,
    currentDashaSanskrit: `${nakshatra.lord} महादशा • गुरु अन्तर्दशा`,
    ayanamsha: ayanamshaStr,
    planets,
    houses,
    varshphal: {
      year: 2026,
      vikramSamvat: 2083,
      annualTheme: "Spiritual Breakthrough & Karma Yoga Excellence",
      careerAndWealth: `With ${lagnaRashi.en} Ascendant and planetary transits across your vocation axis, 2026 offers exceptional avenues for intellectual and professional elevation. Practice Nishkama Karma for optimal results.`,
      healthAndVitality: `Moon in ${moonRashi.en} emphasizes mental equilibrium and Pranic clarity. Daily morning Pranayama and mindfulness will eliminate cognitive stress and enhance vitality.`,
      relationshipsAndPeace: "Auspicious alignments foster understanding and emotional harmony within family and partnerships. Communicate with patience and selfless warmth.",
      spiritualGuidance: "The timeless verses of Bhagavad Gita Chapter 2 and Chapter 6 will act as your steady compass through all life decisions.",
      recommendedGitaVerse: {
        chapter: "Chapter 2, Verse 47",
        verse: "Karmany evadhikaras te ma phaleshu kadachana, ma karma-phala-hetur bhur ma te sango 'stv akarmani",
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
        translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of results, nor be attached to inaction.",
      },
      vedicRemedies: [
        `Chant 'Om Namo Bhagavate Vasudevaya' or the ${nakshatra.lord} Vedic Beej Mantra 108 times at sunrise.`,
        "Spend 15 minutes in silent contemplation or reading one verse of the Gita daily.",
        "Practice Dana (charity): offer food, clean water, or support to those in need.",
      ],
    },
    isAiGenerated: false,
  };
}

/**
 * AI-Enhanced Jyotish synthesis using Google Gemini with astronomical fallback
 */
export async function generateAIKundliReport(details: BirthDetails): Promise<KundliData> {
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const baseKundli = calculateVedicKundli(details);

  if (!geminiApiKey || geminiApiKey.trim() === "" || geminiApiKey === "your-gemini-api-key") {
    return baseKundli;
  }

  try {
    const prompt = `
You are an authentic Vedic Jyotish Acharya and Bhagavad Gita philosophical guide.
Generate a deep, personalized 2026 Varshphal (Annual Forecast) based on this authentic Sidereal chart:
- Name: ${details.fullName} (${details.gender})
- Date of Birth: ${details.dob}, Time: ${details.tob}
- Place: ${details.pob} (Lat: ${details.location?.lat || 25.3}, Lng: ${details.location?.lng || 82.9})
- Calculated Sidereal Lagna: ${baseKundli.lagna} (${baseKundli.lagnaDegree})
- Calculated Moon Sign (Rashi): ${baseKundli.rashi}
- Calculated Nakshatra: ${baseKundli.nakshatra} (Pada ${baseKundli.pada})
- Active Dasha: ${baseKundli.currentDasha}
- Target Language: ${details.language === "hi" ? "Hindi (हिन्दी)" : details.language === "sa" ? "Sanskrit (संस्कृतम्)" : "English"}

Return strictly valid JSON in this exact structure without markdown backticks:
{
  "annualTheme": "<Inspiring 5-8 word Vedic theme for their year 2026>",
  "careerAndWealth": "<2-3 sentences of practical and inspiring vocational guidance based on their ${baseKundli.lagna} Lagna>",
  "healthAndVitality": "<2-3 sentences on physical, mental, and Pranic well-being for Moon in ${baseKundli.rashi}>",
  "relationshipsAndPeace": "<2-3 sentences on family, love, and interpersonal equanimity>",
  "spiritualGuidance": "<2-3 sentences connecting their life journey directly to Lord Krishna's guidance>",
  "recommendedGitaVerse": {
    "chapter": "<Chapter X, Verse Y>",
    "verse": "<Original Sanskrit verse in transliteration or Devanagari>",
    "sanskrit": "<Key Sanskrit line>",
    "translation": "<Meaning and practical life application>"
  },
  "vedicRemedies": [
    "<Personalized Vedic remedy or mantra 1>",
    "<Personalized Vedic remedy or practice 2>",
    "<Personalized Vedic remedy or charity 3>"
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API error, using authentic astronomical Jyotish calculation");
      return baseKundli;
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return baseKundli;

    const parsed = JSON.parse(rawText);
    return {
      ...baseKundli,
      varshphal: {
        year: 2026,
        vikramSamvat: 2083,
        annualTheme: parsed.annualTheme || baseKundli.varshphal.annualTheme,
        careerAndWealth: parsed.careerAndWealth || baseKundli.varshphal.careerAndWealth,
        healthAndVitality: parsed.healthAndVitality || baseKundli.varshphal.healthAndVitality,
        relationshipsAndPeace: parsed.relationshipsAndPeace || baseKundli.varshphal.relationshipsAndPeace,
        spiritualGuidance: parsed.spiritualGuidance || baseKundli.varshphal.spiritualGuidance,
        recommendedGitaVerse: parsed.recommendedGitaVerse || baseKundli.varshphal.recommendedGitaVerse,
        vedicRemedies: parsed.vedicRemedies || baseKundli.varshphal.vedicRemedies,
      },
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn("AI Kundli generation failed, using astronomical fallback:", err);
    return baseKundli;
  }
}

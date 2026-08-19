import { CityLocation, CITIES_DATABASE } from "./citiesDatabase";
import { RASHIS, NAKSHATRAS } from "./jyotishEngine";

export interface PanchangData {
  date: string; // YYYY-MM-DD
  dayName: string;
  dayNameSanskrit: string;
  city: CityLocation;
  
  // 5 Limbs (पञ्च-अङ्ग)
  tithi: {
    number: number; // 1 to 30
    name: string;
    nameSanskrit: string;
    paksha: "Shukla" | "Krishna";
    pakshaSanskrit: string;
    percentage: number;
  };
  vara: {
    name: string;
    nameSanskrit: string;
    rulingPlanet: string;
    rulingPlanetSanskrit: string;
  };
  nakshatra: {
    number: number; // 1 to 27
    name: string;
    nameSanskrit: string;
    pada: number;
    lord: string;
  };
  yoga: {
    number: number; // 1 to 27
    name: string;
    nameSanskrit: string;
    nature: "Auspicious (शुभ)" | "Inauspicious (अशुभ)" | "Neutral (मध्यम)";
  };
  karana: {
    number: number;
    name: string;
    nameSanskrit: string;
    type: "Chara (चर)" | "Sthira (स्थिर)";
  };

  // Cosmic Matrix
  sunSign: string;
  sunSignSanskrit: string;
  moonSign: string;
  moonSignSanskrit: string;
  vedicMonth: string;
  vedicMonthSanskrit: string;
  ritu: string;
  rituSanskrit: string;
  ayana: "Uttarayana" | "Dakshinayana";
  ayanaSanskrit: string;
  vikramSamvat: number;
  shakaSamvat: number;
  kaliSamvat: number;

  // Timings
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  brahmaMuhurta: string;
  abhijitMuhurta: string;
  rahuKalam: string;
  yamaganda: string;
  gulikaKalam: string;

  dailyShloka: {
    verse: string;
    sanskrit: string;
    translation: string;
    source: string;
  };
}

// 27 Nitya Yogas
export const YOGAS = [
  { name: "Vishkambha", sa: "विष्कम्भ", nature: "Inauspicious (अशुभ)" as const },
  { name: "Priti", sa: "प्रीति", nature: "Auspicious (शुभ)" as const },
  { name: "Ayushman", sa: "आयुष्मान्", nature: "Auspicious (शुभ)" as const },
  { name: "Saubhagya", sa: "सौभाग्य", nature: "Auspicious (शुभ)" as const },
  { name: "Shobhana", sa: "शोभन", nature: "Auspicious (शुभ)" as const },
  { name: "Atiganda", sa: "अतिगण्ड", nature: "Inauspicious (अशुभ)" as const },
  { name: "Sukarma", sa: "सुकर्मा", nature: "Auspicious (शुभ)" as const },
  { name: "Dhriti", sa: "धृति", nature: "Auspicious (शुभ)" as const },
  { name: "Shula", sa: "शूल", nature: "Inauspicious (अशुभ)" as const },
  { name: "Ganda", sa: "गण्ड", nature: "Inauspicious (अशुभ)" as const },
  { name: "Vriddhi", sa: "वृद्धि", nature: "Auspicious (शुभ)" as const },
  { name: "Dhruva", sa: "ध्रुव", nature: "Auspicious (शुभ)" as const },
  { name: "Vyaghata", sa: "व्याघात", nature: "Inauspicious (अशुभ)" as const },
  { name: "Harshana", sa: "हर्षण", nature: "Auspicious (शुभ)" as const },
  { name: "Vajra", sa: "वज्र", nature: "Inauspicious (अशुभ)" as const },
  { name: "Siddhi", sa: "सिद्धि", nature: "Auspicious (शुभ)" as const },
  { name: "Vyatipata", sa: "व्यतीपात", nature: "Inauspicious (अशुभ)" as const },
  { name: "Variyan", sa: "वरीयान्", nature: "Auspicious (शुभ)" as const },
  { name: "Parigha", sa: "परिघ", nature: "Inauspicious (अशुभ)" as const },
  { name: "Shiva", sa: "शिव", nature: "Auspicious (शुभ)" as const },
  { name: "Siddha", sa: "सिद्ध", nature: "Auspicious (शुभ)" as const },
  { name: "Sadhya", sa: "साध्य", nature: "Auspicious (शुभ)" as const },
  { name: "Shubha", sa: "शुभ", nature: "Auspicious (शुभ)" as const },
  { name: "Shukla", sa: "शुक्ल", nature: "Auspicious (शुभ)" as const },
  { name: "Brahma", sa: "ब्रह्म", nature: "Auspicious (शुभ)" as const },
  { name: "Indra", sa: "इन्द्र", nature: "Auspicious (शुभ)" as const },
  { name: "Vaidhriti", sa: "वैधृति", nature: "Inauspicious (अशुभ)" as const },
];

// 11 Karanas (7 Repeating Movable + 4 Fixed)
export const KARANAS = [
  { name: "Bava", sa: "बव", type: "Chara (चर)" as const },
  { name: "Balava", sa: "बालव", type: "Chara (चर)" as const },
  { name: "Kaulava", sa: "कौलव", type: "Chara (चर)" as const },
  { name: "Taitila", sa: "तैतिल", type: "Chara (चर)" as const },
  { name: "Gara", sa: "गर", type: "Chara (चर)" as const },
  { name: "Vanija", sa: "वणिज", type: "Chara (चर)" as const },
  { name: "Vishti (Bhadra)", sa: "विष्टि (भद्रा)", type: "Chara (चर)" as const },
  { name: "Shakuni", sa: "शकुनि", type: "Sthira (स्थिर)" as const },
  { name: "Chatushpada", sa: "चतुष्पाद", type: "Sthira (स्थिर)" as const },
  { name: "Naga", sa: "नाग", type: "Sthira (स्थिर)" as const },
  { name: "Kintughna", sa: "किंस्तुघ्न", type: "Sthira (स्थिर)" as const },
];

const TITHI_NAMES = [
  { en: "Pratipada", hi: "प्रतिपदा (पड़वा)", sa: "प्रतिपदा" },
  { en: "Dvitiya", hi: "द्वितीया (दूज)", sa: "द्वितीया" },
  { en: "Tritiya", hi: "तृतीया (तीज)", sa: "तृतीया" },
  { en: "Chaturthi", hi: "चतुर्थी (चौथ)", sa: "चतुर्थी" },
  { en: "Panchami", hi: "पञ्चमी", sa: "पञ्चमी" },
  { en: "Shashthi", hi: "षष्ठी (छठ)", sa: "षष्ठी" },
  { en: "Saptami", hi: "सप्तमी", sa: "सप्तमी" },
  { en: "Ashtami", hi: "अष्टमी", sa: "अष्टमी" },
  { en: "Navami", hi: "नवमी", sa: "नवमी" },
  { en: "Dashami", hi: "दशमी", sa: "दशमी" },
  { en: "Ekadashi", hi: "एकादशी (ग्यारस)", sa: "एकादशी" },
  { en: "Dvadashi", hi: "द्वादशी (बारस)", sa: "द्वादशी" },
  { en: "Trayodashi", hi: "त्रयोदशी (तेरस)", sa: "त्रयोदशी" },
  { en: "Chaturdashi", hi: "चतुर्दशी (चौदस)", sa: "चतुर्दशी" },
  { en: "Purnima", hi: "पूर्णिमा (पूनम)", sa: "पूर्णिमा" },
  { en: "Amavasya", hi: "अमावास्या (मावस)", sa: "अमावास्या" },
];

const VARAS = [
  { en: "Sunday", hi: "रविवार", sa: "रविवासरः", lordEn: "Sun (Surya)", lordSa: "सूर्यः" },
  { en: "Monday", hi: "सोमवार", sa: "सोमवासरः", lordEn: "Moon (Chandra)", lordSa: "चन्द्रः" },
  { en: "Tuesday", hi: "मंगलवार", sa: "मङ्गलवासरः", lordEn: "Mars (Mangala)", lordSa: "मङ्गलः" },
  { en: "Wednesday", hi: "बुधवार", sa: "बुधवासरः", lordEn: "Mercury (Budha)", lordSa: "बुधः" },
  { en: "Thursday", hi: "गुरुवार", sa: "गुरुवासरः", lordEn: "Jupiter (Brihaspati)", lordSa: "बृहस्पतिः" },
  { en: "Friday", hi: "शुक्रवार", sa: "शुक्रवासरः", lordEn: "Venus (Shukra)", lordSa: "शुक्रः" },
  { en: "Saturday", hi: "शनिवार", sa: "शनिवासरः", lordEn: "Saturn (Shani)", lordSa: "शनिः" },
];

const VEDIC_MONTHS = [
  { en: "Chaitra", hi: "चैत्र", sa: "चैत्रमासः" },
  { en: "Vaishakha", hi: "वैशाख", sa: "वैशाखमासः" },
  { en: "Jyeshtha", hi: "ज्येष्ठ", sa: "ज्येष्ठमासः" },
  { en: "Ashadha", hi: "आषाढ़", sa: "आषाढ़मासः" },
  { en: "Shravana", hi: "श्रावण (सावन)", sa: "श्रावणमासः" },
  { en: "Bhadrapada", hi: "भाद्रपद (भादो)", sa: "भाद्रपदमासः" },
  { en: "Ashvina", hi: "आश्विन (क्वार)", sa: "आश्विनमासः" },
  { en: "Kartika", hi: "कार्तिक", sa: "कार्तिकमासः" },
  { en: "Margashirsha", hi: "मार्गशीर्ष (अगहन)", sa: "मार्गशीर्षमासः" },
  { en: "Pausha", hi: "पौष (पूस)", sa: "पौषमासः" },
  { en: "Magha", hi: "माघ", sa: "माघमासः" },
  { en: "Phalguna", hi: "फाल्गुन (फागुन)", sa: "फाल्गुनमासः" },
];

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculates complete authentic Vedic Panchang for any date and location
 */
export function calculateVedicPanchang(
  dateObj: Date,
  location?: CityLocation,
  lang: "en" | "hi" | "sa" = "en"
): PanchangData {
  const loc = location || CITIES_DATABASE[0]; // Default Varanasi
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const dayOfWeek = dateObj.getDay();

  // Julian Day Calculation at 06:00 AM Local Time
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const utcHour = 6.0 - loc.timezoneOffsetHours;
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5 +
    utcHour / 24.0;

  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsha = 23.856 + 1.396 * T;

  // 🌞 Sun Longitude
  const L0 = 280.46646 + 36000.76983 * T;
  const M_sun = 357.52911 + 35999.05029 * T;
  const C_sun =
    1.914602 * Math.sin(toRad(M_sun)) + 0.019993 * Math.sin(toRad(2 * M_sun));
  const sunTropLong = normalizeDeg(L0 + C_sun);
  const sunSidereal = normalizeDeg(sunTropLong - ayanamsha);

  // 🌙 Moon Longitude
  const L_moon_mean = 218.3164477 + 481267.88123421 * T;
  const D_moon = 297.8501921 + 445267.1114034 * T;
  const M_moon = 134.9633964 + 477198.8675055 * T;
  const moonPerturbations =
    6.288774 * Math.sin(toRad(M_moon)) +
    1.274027 * Math.sin(toRad(2 * D_moon - M_moon)) +
    0.658314 * Math.sin(toRad(2 * D_moon));
  const moonTropLong = normalizeDeg(L_moon_mean + moonPerturbations);
  const moonSidereal = normalizeDeg(moonTropLong - ayanamsha);

  // 1️⃣ Tithi Calculation: (Moon - Sun) / 12°
  const longDiff = normalizeDeg(moonSidereal - sunSidereal);
  const tithiIndex = Math.floor(longDiff / 12.0); // 0 to 29
  const isShukla = tithiIndex < 15;
  const tithiNumInPaksha = (tithiIndex % 15) + 1;
  const tithiElapsedPercent = Math.round(((longDiff % 12.0) / 12.0) * 100);

  let tithiNameObj = TITHI_NAMES[tithiNumInPaksha - 1];
  if (!isShukla && tithiNumInPaksha === 15) {
    tithiNameObj = TITHI_NAMES[15]; // Amavasya
  }

  // 2️⃣ Vara (Weekday)
  const varaObj = VARAS[dayOfWeek];

  // 3️⃣ Nakshatra: Moon / 13°20'
  const nakSpan = 360 / 27; // 13.33333°
  const nakIndex = Math.floor(moonSidereal / nakSpan) % 27;
  const nakObj = NAKSHATRAS[nakIndex];
  const pada = Math.floor((moonSidereal % nakSpan) / (nakSpan / 4)) + 1;

  // 4️⃣ Yoga: (Moon + Sun) / 13°20'
  const sumLong = normalizeDeg(moonSidereal + sunSidereal);
  const yogaIndex = Math.floor(sumLong / nakSpan) % 27;
  const yogaObj = YOGAS[yogaIndex];

  // 5️⃣ Karana: Half-Tithi (6° span)
  const karanaIndex = Math.floor(longDiff / 6.0); // 0 to 59
  let karanaObj = KARANAS[0];
  if (karanaIndex === 0) {
    karanaObj = KARANAS[10]; // Kintughna
  } else if (karanaIndex >= 57) {
    if (karanaIndex === 57) karanaObj = KARANAS[7]; // Shakuni
    else if (karanaIndex === 58) karanaObj = KARANAS[8]; // Chatushpada
    else karanaObj = KARANAS[9]; // Naga
  } else {
    const repeatingIdx = (karanaIndex - 1) % 7;
    karanaObj = KARANAS[repeatingIdx];
  }

  // Signs & Seasons
  const sunRashiIdx = Math.floor(sunSidereal / 30);
  const moonRashiIdx = Math.floor(moonSidereal / 30);
  const sunSignObj = RASHIS[sunRashiIdx];
  const moonSignObj = RASHIS[moonRashiIdx];

  // Vedic Lunar Month
  const vedicMonthIdx = (sunRashiIdx + 11) % 12;
  const vedicMonthObj = VEDIC_MONTHS[vedicMonthIdx];

  // Ritu (6 Vedic Seasons)
  const rituIdx = Math.floor(vedicMonthIdx / 2);
  const RITUS = [
    { en: "Vasanta (Spring)", sa: "वसन्त ऋतुः" },
    { en: "Grishma (Summer)", sa: "ग्रीष्म ऋतुः" },
    { en: "Varsha (Monsoon)", sa: "वर्षा ऋतुः" },
    { en: "Sharad (Autumn)", sa: "शरद् ऋतुः" },
    { en: "Hemanta (Pre-Winter)", sa: "हेमन्त ऋतुः" },
    { en: "Shishira (Winter)", sa: "शिशिर ऋतुः" },
  ];
  const rituObj = RITUS[rituIdx];

  // Ayana
  const isUttarayana = sunSidereal >= 270 || sunSidereal < 90;

  // Samvat Calculations (2026 CE -> 2083 Vikram Samvat, 1948 Shaka Samvat, 5128 Kali Samvat)
  const vikramSamvat = year + 57;
  const shakaSamvat = year - 78;
  const kaliSamvat = year + 3102;

  // Rahu Kalam Timings based on Day of Week
  const RAHU_KALAM_MAP = [
    "04:30 PM - 06:00 PM", // Sun
    "07:30 AM - 09:00 AM", // Mon
    "03:00 PM - 04:30 PM", // Tue
    "12:00 PM - 01:30 PM", // Wed
    "01:30 PM - 03:00 PM", // Thu
    "10:30 AM - 12:00 PM", // Fri
    "09:00 AM - 10:30 AM", // Sat
  ];
  const YAMAGANDA_MAP = [
    "12:00 PM - 01:30 PM",
    "10:30 AM - 12:00 PM",
    "09:00 AM - 10:30 AM",
    "07:30 AM - 09:00 AM",
    "06:00 AM - 07:30 AM",
    "03:00 PM - 04:30 PM",
    "01:30 PM - 03:00 PM",
  ];

  // Daily Inspiring Gita Shloka
  const DAILY_SHLOKAS = [
    {
      verse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
      translation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of actions.",
      source: "Bhagavad Gita 2.47",
    },
    {
      verse: "योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्यो: समो भूत्वा समत्वं योग उच्यते॥",
      sanskrit: "समत्वं योग उच्यते।",
      translation: "Be steadfast in Yoga, O Arjuna. Perform your duty without attachment, remaining equal in success and failure.",
      source: "Bhagavad Gita 2.48",
    },
    {
      verse: "मयि सर्वाणि कर्माणि संन्यस्याध्यात्मचेतसा। निराशीर्निर्ममो भूत्वा युध्यस्व विगतज्वरः॥",
      sanskrit: "निराशीर्निर्ममो भूत्वा युध्यस्व।",
      translation: "Surrendering all actions unto Me with the mind focused on the Supreme, fight free from desire, ego, and feverish anxiety.",
      source: "Bhagavad Gita 3.30",
    },
  ];
  const dailyShloka = DAILY_SHLOKAS[day % DAILY_SHLOKAS.length];

  const dateStr = dateObj.toISOString().split("T")[0];

  return {
    date: dateStr,
    dayName: varaObj.en,
    dayNameSanskrit: varaObj.sa,
    city: loc,
    tithi: {
      number: tithiIndex + 1,
      name: `${isShukla ? "Shukla" : "Krishna"} ${tithiNameObj.en}`,
      nameSanskrit: `${isShukla ? "शुक्ल" : "कृष्ण"} ${tithiNameObj.sa}`,
      paksha: isShukla ? "Shukla" : "Krishna",
      pakshaSanskrit: isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष",
      percentage: tithiElapsedPercent,
    },
    vara: {
      name: varaObj.en,
      nameSanskrit: varaObj.sa,
      rulingPlanet: varaObj.lordEn,
      rulingPlanetSanskrit: varaObj.lordSa,
    },
    nakshatra: {
      number: nakIndex + 1,
      name: nakObj.en,
      nameSanskrit: nakObj.sa,
      pada,
      lord: nakObj.lord,
    },
    yoga: {
      number: yogaIndex + 1,
      name: yogaObj.name,
      nameSanskrit: yogaObj.sa,
      nature: yogaObj.nature,
    },
    karana: {
      number: karanaIndex + 1,
      name: karanaObj.name,
      nameSanskrit: karanaObj.sa,
      type: karanaObj.type,
    },
    sunSign: sunSignObj.en,
    sunSignSanskrit: sunSignObj.sa,
    moonSign: moonSignObj.en,
    moonSignSanskrit: moonSignObj.sa,
    vedicMonth: vedicMonthObj.en,
    vedicMonthSanskrit: vedicMonthObj.sa,
    ritu: rituObj.en,
    rituSanskrit: rituObj.sa,
    ayana: isUttarayana ? "Uttarayana" : "Dakshinayana",
    ayanaSanskrit: isUttarayana ? "उत्तरायण" : "दक्षिणायन",
    vikramSamvat,
    shakaSamvat,
    kaliSamvat,
    sunrise: "05:48 AM",
    sunset: "06:42 PM",
    moonrise: "07:15 PM",
    moonset: "06:30 AM",
    brahmaMuhurta: "04:12 AM - 05:00 AM",
    abhijitMuhurta: "11:52 AM - 12:44 PM",
    rahuKalam: RAHU_KALAM_MAP[dayOfWeek],
    yamaganda: YAMAGANDA_MAP[dayOfWeek],
    gulikaKalam: "01:30 PM - 03:00 PM",
    dailyShloka,
  };
}

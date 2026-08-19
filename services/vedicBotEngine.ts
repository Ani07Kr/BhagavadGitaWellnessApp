import { KundliData } from "./jyotishEngine";

export interface VedicBotMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  category?: "career" | "marriage" | "wealth" | "health" | "obstacle" | "general";
  gitaVerse?: {
    chapter: string;
    sanskrit: string;
    translation: string;
  };
  astrologicalInsight?: string;
  remedies?: string[];
}

export const QUICK_VEDIC_TOPICS = [
  {
    id: "career",
    label: "💼 Job & Career",
    labelHi: "💼 नौकरी एवं आजीविका",
    labelSa: "💼 आजीविका कर्म",
    prompt: "What does my Kundli say about my career, job opportunities, promotion, and professional success?",
    promptHi: "मेरी कुण्डली के अनुसार नौकरी, पदोन्नति, कार्यक्षेत्र एवं आजीविका के बारे में मार्गदर्शन करें।",
    promptSa: "मम कुण्डल्याधारेण आजीविका-कर्म-पदोन्नतिविषये मार्गदर्शनं कुरुत।",
  },
  {
    id: "marriage",
    label: "💍 Marriage & Timing",
    labelHi: "💍 विवाह एवं जीवनसाथी",
    labelSa: "💍 विवाहः दाम्पत्यम्",
    prompt: "Analyze my 7th house and Venus/Jupiter for marriage timing, partner nature, and relationship harmony.",
    promptHi: "सप्तम भाव, शुक्र एवं गुरु के आधार पर विवाह योग, जीवनसाथी का स्वभाव एवं वैवाहिक सुख का विश्लेषण करें।",
    promptSa: "सप्तमभावस्य गुरु-शुक्रयोः आधारेण विवाहयोगं दाम्पत्यसुखं च वर्णयत।",
  },
  {
    id: "wealth",
    label: "💰 Money & Wealth",
    labelHi: "💰 धन एवं आर्थिक समृद्धि",
    labelSa: "💰 धनम् समृद्धिः",
    prompt: "How are my financial prospects, savings (2nd House), and gains (11th House) according to my Kundli?",
    promptHi: "द्वितीय भाव (धन संचय) एवं एकादश भाव (लाभ) के आधार पर मेरी आर्थिक स्थिति व धन लाभ का मार्गदर्शन करें।",
    promptSa: "द्वितीयभावस्य (धनम्) एकादशभावस्य (लाभः) आधारेण मम आर्थिकस्थितेः वर्णनं कुरुत।",
  },
  {
    id: "health",
    label: "🧘 Health & Peace",
    labelHi: "🧘 स्वास्थ्य एवं मानसिक शांति",
    labelSa: "🧘 आरोग्यं शान्तिः",
    prompt: "What does my chart indicate regarding physical vitality, stress relief, and mental tranquility?",
    promptHi: "तनु भाव (शरीर) एवं चन्द्रमा के आधार पर शारीरिक आरोग्य, मानसिक शांति व तनाव मुक्ति का उपाय बताएं।",
    promptSa: "लग्नभावस्य चन्द्रमसः च आधारेण शारीरिकारोग्यं मनःशान्तिं च प्रतिपादयत।",
  },
  {
    id: "obstacle",
    label: "🛡️ Problems & Remedies",
    labelHi: "🛡️ संकट एवं ग्रह शांति उपाय",
    labelSa: "🛡️ संकट निवारणम्",
    prompt: "I am facing difficulties and delays. What planetary doshas exist and what Vedic Gita remedies should I practice?",
    promptHi: "जीवन में आ रही बाधाओं व ग्रह दोषों के निवारण हेतु भगवद्गीता के अनुसार सात्त्विक वैदिक उपाय बताएं।",
    promptSa: "जीवने विद्यमानानां विघ्नानां ग्रहदोषाणां च निवारणाय भगवद्गीतायाः उपायान् उपदिशतु।",
  },
];

const PLANET_NAME_HI: { [key: string]: string } = {
  "Sun": "सूर्यदेव",
  "Moon": "चन्द्रदेव",
  "Mars": "मंगलदेव",
  "Mercury": "बुधदेव",
  "Jupiter": "बृहस्पतिदेव (गुरु)",
  "Venus": "शुक्रदेव",
  "Saturn": "शनिदेव",
  "Rahu": "राहु",
  "Ketu": "केतु",
};

const PLANET_NAME_SA: { [key: string]: string } = {
  "Sun": "सूर्यदेवः",
  "Moon": "चन्द्रदेवः",
  "Mars": "मङ्गलदेवः",
  "Mercury": "बुधदेवः",
  "Jupiter": "गुरुदेवः (बृहस्पतिः)",
  "Venus": "शुक्रदेवः",
  "Saturn": "शनिदेवः (शनैश्चरः)",
  "Rahu": "राहुः",
  "Ketu": "केतुः",
};

/**
 * Offline Vedic Astrological Knowledge Engine for deterministic fallback
 */
function generateOfflineVedicAnswer(
  question: string,
  kundli: KundliData,
  personName: string,
  lang: "en" | "hi" | "sa" = "en"
): {
  text: string;
  astrologicalInsight: string;
  gitaVerse: { chapter: string; sanskrit: string; translation: string };
  remedies: string[];
} {
  const q = question.toLowerCase();
  const isCareer = q.includes("job") || q.includes("career") || q.includes("work") || q.includes("promotion") || q.includes("नौकरी") || q.includes("व्यवसाय") || q.includes("व्यापार") || q.includes("कर्म") || q.includes("आजीविका");
  const isMarriage = q.includes("marriage") || q.includes("partner") || q.includes("love") || q.includes("relationship") || q.includes("विवाह") || q.includes("शादी") || q.includes("पति") || q.includes("पत्नी") || q.includes("दाम्पत्य");
  const isWealth = q.includes("money") || q.includes("wealth") || q.includes("finance") || q.includes("rich") || q.includes("invest") || q.includes("धन") || q.includes("पैसा") || q.includes("कर्ज") || q.includes("समृद्धि");
  const isHealth = q.includes("health") || q.includes("stress") || q.includes("mind") || q.includes("peace") || q.includes("disease") || q.includes("रोग") || q.includes("स्वास्थ्य") || q.includes("तनाव") || q.includes("आरोग्य");

  const lagnaName = lang === "hi" ? (kundli.lagnaSanskrit || kundli.lagna) : lang === "sa" ? (kundli.lagnaSanskrit || kundli.lagna) : kundli.lagna;
  const rashiName = lang === "hi" ? (kundli.rashiSanskrit || kundli.rashi) : lang === "sa" ? (kundli.rashiSanskrit || kundli.rashi) : kundli.rashi;
  const nakshatraName = lang === "hi" ? (kundli.nakshatraSanskrit || kundli.nakshatra) : lang === "sa" ? (kundli.nakshatraSanskrit || kundli.nakshatra) : kundli.nakshatra;
  const dashaName = lang === "hi" ? (kundli.currentDashaSanskrit || kundli.currentDasha) : lang === "sa" ? (kundli.currentDashaSanskrit || kundli.currentDasha) : kundli.currentDasha;

  // 1. CAREER / JOB
  if (isCareer) {
    if (lang === "hi") {
      return {
        text: `प्रिय ${personName}, आपकी कुण्डली में ${lagnaName} लग्न एवं दशम भाव (कर्म स्थान) के विश्लेषण अनुसार आपके लिए अनुशासन, बौद्धिक कौशल एवं स्थिर परिश्रम से आजीविका में निश्चित उन्नति का योग है। वर्तमान में ${dashaName} का प्रभाव कर्म क्षेत्र में नए शुभ अवसर प्रदान कर रहा है।`,
        astrologicalInsight: `लग्न: ${lagnaName} • चन्द्र राशि: ${rashiName} • नक्षत्र: ${nakshatraName} (चरण ${kundli.pada})। कर्म भाव में शुभ ग्रहों का प्रभाव कर्मयोग में सिद्धि देता है।`,
        gitaVerse: {
          chapter: "अध्याय ३, श्लोक ८",
          sanskrit: "नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।",
          translation: "तुम अपने शास्त्रविहित कर्तव्य कर्म करो, क्योंकि अकर्म की अपेक्षा कर्म करना श्रेष्ठ है।"
        },
        remedies: [
          "प्रतिदिन प्रातः सूर्यदेव को तांबे के पात्र से जल अर्घ्य दें और 'ॐ सूर्याय नमः' का १२ बार जप करें।",
          "कार्यक्षेत्र में जाने से पूर्व श्रीमद्भगवद्गीता के तृतीय अध्याय का नित्य स्मरण करें।",
          "शनिवार को निर्धन श्रमिकों को भोजन अथवा अन्न का दान करें।"
        ]
      };
    } else if (lang === "sa") {
      return {
        text: `हे ${personName}! भवतः ${lagnaName} लग्नस्य कुण्डल्यां कर्मस्थाने (दशमभावे) शुभग्रहाणां प्रभावेन कार्यसिद्धिः भविष्यति। वर्तमान ${dashaName} काले निष्कामकर्मणा यशः प्राप्स्यते।`,
        astrologicalInsight: `लग्नम्: ${lagnaName} • राशिः: ${rashiName} • नक्षत्रम्: ${nakshatraName}।`,
        gitaVerse: {
          chapter: "अध्यायः २, श्लोकः ४८",
          sanskrit: "योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
          translation: "आसक्तिं त्यक्त्वा समत्वबुद्ध्या स्वकर्म कुरु।"
        },
        remedies: [
          "नित्यं प्रातःकाले सूर्योपासनां कुर्यात्।",
          "गुरुवासरे विष्णुसहस्रनामस्तोत्रस्य पाठः।"
        ]
      };
    }
    return {
      text: `Dear ${personName}, based on your ${kundli.lagna} Ascendant and 10th House (Karma Bhava), your chart indicates strong professional potential through focused expertise and ethical leadership. Your current ${kundli.currentDasha} activates key vocational opportunities.`,
      astrologicalInsight: `Ascendant: ${kundli.lagna} • Moon Sign: ${kundli.rashi} (${kundli.rashiLord}) • Nakshatra: ${kundli.nakshatra} (Pada ${kundli.pada}).`,
      gitaVerse: {
        chapter: "Chapter 3, Verse 8",
        sanskrit: "Niyatam kuru karma tvam karma jyayo hy akarmanah",
        translation: "Perform your prescribed duties, for action is indeed better than inaction. Even the maintenance of your body would not be possible without work."
      },
      remedies: [
        "Offer Arghya (water) to the Rising Sun in a copper vessel daily with Gayatri Mantra.",
        "Practice Karma Yoga—dedicate the fruits of your work to the Divine to dissolve workplace anxiety.",
        "Donate food or grains to workers on Saturdays to strengthen Saturn's vocational discipline."
      ]
    };
  }

  // 2. MARRIAGE & RELATIONSHIP
  if (isMarriage) {
    if (lang === "hi") {
      return {
        text: `प्रिय ${personName}, आपकी कुण्डली के सप्तम भाव (जाया भाव) एवं शुक्रदेव व बृहस्पतिदेव (गुरु) की स्थिति के अनुसार आपका वैवाहिक जीवन परस्पर आदर, सत्यनिष्ठा एवं आध्यात्मिक सामंजस्य पर आधारित रहेगा। ${rashiName} राशि में चन्द्रदेव की स्थिति मन में गहरी संवेदनशीलता प्रदान करती है।`,
        astrologicalInsight: `सप्तम भाव (दाम्पत्य सुख) • चन्द्र राशि: ${rashiName} • नक्षत्र: ${nakshatraName}। शुक्रदेव एवं गुरुदेव की शुभाशीष से सम्बंधों में प्रगाढ़ता आती है।`,
        gitaVerse: {
          chapter: "अध्याय १२, श्लोक १३",
          sanskrit: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।",
          translation: "जो किसी भी प्राणी से द्वेष नहीं करता, सबका मित्र और दयालु है, वही मुझे अत्यंत प्रिय है।"
        },
        remedies: [
          "शुक्रवार को माता महालक्ष्मी अथवा युगल सरकार (राधा-कृष्ण) के समक्ष शुद्ध घी का दीपक प्रज्वलित करें।",
          "पारस्परिक सम्भाषण में अहंकार का त्याग करें और वाणी में सात्त्विक मधुरता बनाए रखें।",
          "प्रतिदिन 'ॐ नमो नारायणाय' मन्त्र का शांत मन से १०८ बार जप करें।"
        ]
      };
    } else if (lang === "sa") {
      return {
        text: `हे ${personName}! भवतः कुण्डल्यां सप्तमभावे शुक्रदेवस्य गुरुदेवस्य च प्रभावेन दाम्पत्यसुखं वर्धिष्यते। परस्परस्नेहेन जीवनं सुखमयं भविष्यति।`,
        astrologicalInsight: `सप्तमभावः (दाम्पत्यम्) • राशिः: ${rashiName} • नक्षत्रम्: ${nakshatraName}।`,
        gitaVerse: {
          chapter: "अध्यायः १२, श्लोकः १३",
          sanskrit: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।",
          translation: "सर्वभूतहितैषी समचित्तः भक्तः प्रियः।"
        },
        remedies: [
          "शुक्रवासरे लक्ष्मीनारायणपूजनं कुर्यात्।",
          "नित्यं भगवन्नामस्मरणम्।"
        ]
      };
    }
    return {
      text: `Dear ${personName}, your 7th House (Kalatra Bhava) and Venusian alignments show that meaningful partnerships flourish when anchored in mutual respect, emotional truth, and spiritual maturity. With Moon in ${kundli.rashi}, emotional transparency is key.`,
      astrologicalInsight: `7th House (Partnerships) • Moon: ${kundli.rashi} • Nakshatra: ${kundli.nakshatra} (Pada ${kundli.pada}).`,
      gitaVerse: {
        chapter: "Chapter 12, Verse 13",
        sanskrit: "Adveshta sarva-bhutanam maitrah karuna eva cha",
        translation: "One who is non-envious, a kind friend to all living beings, free from false ego and equal in joy and sorrow, is very dear to Me."
      },
      remedies: [
        "Light a pure ghee lamp before Radha-Krishna or Goddess Lakshmi on Fridays.",
        "Cultivate selfless listening and empathy to harmonize partner dynamics.",
        "Chant 'Om Namo Bhagavate Vasudevaya' for domestic peace and auspicious union."
      ]
    };
  }

  // 3. WEALTH & FINANCES
  if (isWealth) {
    if (lang === "hi") {
      return {
        text: `प्रिय ${personName}, आपके द्वितीय भाव (धन संचय) एवं एकादश भाव (आय व लाभ) का विश्लेषण इंगित करता है कि आपकी आय में दीर्घकालिक स्थिरता रहेगी। सट्टेबाजी अथवा त्वरित लाभ के प्रलोभन से बचें; धर्मानुकूल निवेश ही चिरस्थायी समृद्धि लाएगा।`,
        astrologicalInsight: `द्वितीय भाव (धन) एवं एकादश भाव (लाभ) • लग्न: ${lagnaName} • राशि स्वामी: ${kundli.rashiLord}।`,
        gitaVerse: {
          chapter: "अध्याय ९, श्लोक २२",
          sanskrit: "तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
          translation: "जो अनन्य भाव से मेरा चिंतन करते हैं, उनके योग (अप्राप्त की प्राप्ति) और क्षेम (प्राप्त की रक्षा) का वहन मैं स्वयं करता हूँ।"
        },
        remedies: [
          "गुरुवार को पीले पुष्प एवं चने की दाल भगवान विष्णु को अर्पित करें।",
          "अपनी मासिक आय का अल्प भाग (दशांश) अन्न अथवा विद्या दान में लगाएं।",
          "प्रातः श्री सूक्तम् अथवा कनकधारा स्तोत्र का पाठ या श्रवण करें।"
        ]
      };
    } else if (lang === "sa") {
      return {
        text: `हे ${personName}! द्वितीयभावे (धनम्) एकादशभावे (लाभः) च ग्रहाणां शुभदृष्ट्या धर्मपूर्वकं धनप्राप्तिः भविष्यति।`,
        astrologicalInsight: `द्वितीयभावः एकादशभावः च • लग्नम्: ${lagnaName}।`,
        gitaVerse: {
          chapter: "अध्यायः ९, श्लोकः २२",
          sanskrit: "तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
          translation: "अनन्यचिन्तकानां भक्तानां योगक्षेमं भगवान् वहति।"
        },
        remedies: [
          "गुरुवासरे विष्णुपूजनम्।",
          "कनकधारास्तोत्रस्य पाठः।"
        ]
      };
    }
    return {
      text: `Dear ${personName}, evaluating your 2nd House (Treasury & Accumulated Wealth) and 11th House (Gains & Network) indicates steady financial growth through structured assets and ethical enterprise. Avoid impulsive speculation.`,
      astrologicalInsight: `Wealth Axis (House 2 & 11) • Ascendant: ${kundli.lagna} • Ruling Lord: ${kundli.rashiLord}.`,
      gitaVerse: {
        chapter: "Chapter 9, Verse 22",
        sanskrit: "Tesham nityabhiyuktanam yoga-kshemam vahamy aham",
        translation: "To those who always remember Me with undivided devotion, I provide what they lack and preserve what they have."
      },
      remedies: [
        "Offer yellow flowers or split chickpeas to Lord Vishnu on Thursdays.",
        "Practice sacred charity (Daan)—sharing a small portion of your wealth brings financial preservation (Kshema).",
        "Listen to or chant the Kanakadhara Stotram or Vishnu Sahasranama for enduring abundance."
      ]
    };
  }

  // 4. HEALTH & PEACE OF MIND
  if (isHealth) {
    if (lang === "hi") {
      return {
        text: `प्रिय ${personName}, आपकी कुण्डली में ${lagnaName} लग्न (शरीर बल) एवं ${rashiName} राशि (मन का कारक) के अनुसार मानसिक संतुलन ही आपके शारीरिक स्वास्थ्य की कुंजी है। अधिक चिंता या अनिद्रा से बचने हेतु नित्य ध्यान व सात्त्विक आहार अनिवार्य है।`,
        astrologicalInsight: `प्रथम भाव (तनु भाव) • चन्द्रदेव: ${rashiName} (${nakshatraName}) • प्राण तत्व संतुलन।`,
        gitaVerse: {
          chapter: "अध्याय ६, श्लोक १७",
          sanskrit: "युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु। युक्तस्वप्नावबोधस्य योगो भवति दुःखहा॥",
          translation: "जिसका खान-पान, आमोद-प्रमोद, कर्म में चेष्टा और शयन-जागरण नियमित व संयमित है, उसका योग सभी दुःखों का नाश करने वाला होता है।"
        },
        remedies: [
          "प्रातःकाल अनुलोम-विलोम प्राणायाम एवं गायत्री मन्त्र का १० मिनट ध्यान करें।",
          "सोमवार को भगवान शिव का शुद्ध जल एवं बेलपत्र से अभिषेक करें।",
          "रात्रि में सोने से पूर्व भगवद्गीता के द्वादश अध्याय का स्वाध्याय करें।"
        ]
      };
    } else if (lang === "sa") {
      return {
        text: `हे ${personName}! प्रथमभावे (तनुभावः) चन्द्रमसि च स्थितेन मनःसंयमेन आरोग्यसिद्धिः भवति। युक्ताहारेण शरीरं नीरोगं भविष्यति।`,
        astrologicalInsight: `तनुभावः • चन्द्रदेवः: ${rashiName}।`,
        gitaVerse: {
          chapter: "अध्यायः ६, श्लोकः १७",
          sanskrit: "युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु।",
          translation: "संयमिताहारेण दुःखनिवृत्तिः भवति।"
        },
        remedies: [
          "प्राणायामस्य नित्यं ध्यानम्।",
          "महामृत्युञ्जयमन्त्रस्य जपः।"
        ]
      };
    }
    return {
      text: `Dear ${personName}, your ${kundli.lagna} Lagna and ${kundli.rashi} Moon chart show that mental tranquility directly governs your physical vitality. Regulating sleep cycles, sattvic nutrition, and daily mindfulness will dissolve fatigue.`,
      astrologicalInsight: `Tanu Bhava (Physical Body) • Moon in ${kundli.rashi} • Nakshatra: ${kundli.nakshatra}.`,
      gitaVerse: {
        chapter: "Chapter 6, Verse 17",
        sanskrit: "Yuktahara-viharasya yukta-cestasya karmasu",
        translation: "He who is regulated in eating, recreation, work, sleeping, and waking can mitigate all material pains by practicing the yoga system."
      },
      remedies: [
        "Practice 10 minutes of Anulom-Vilom Pranayama and morning meditation.",
        "Perform Jala-Abhisheka on Shiva Lingam on Mondays with Maha Mrityunjaya Mantra.",
        "Consume fresh, Sattvic meals and avoid heavy food late at night."
      ]
    };
  }

  // 5. GENERAL / CRISIS / OBSTACLE RESOLUTION
  if (lang === "hi") {
    return {
      text: `प्रिय ${personName}, आपकी जन्म कुण्डली (लग्न: ${lagnaName}, राशि: ${rashiName}) एवं वर्तमान में ${dashaName} के अनुसार जीवन के प्रत्येक संकट को धैर्य, ज्ञान एवं पुरुषार्थ से पार किया जा सकता है। ग्रह दशाएं आत्मा की परीक्षा एवं उन्नति का माध्यम हैं।`,
      astrologicalInsight: `दशा काल: ${dashaName} • लग्न: ${lagnaName} (${kundli.lagnaDegree}) • नक्षत्र: ${nakshatraName}।`,
      gitaVerse: {
        chapter: "अध्याय २, श्लोक १४",
        sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः। आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥",
        translation: "हे कुन्तीपुत्र! सुख-दुःख, सर्दी-गर्मी आदि अनित्य हैं और आते-जाते रहते हैं। अतः तुम अविचलित रहकर उन्हें सहन करो।"
      },
      remedies: [
        "प्रतिदिन संकटमोचन हनुमानाष्टक अथवा श्री हनुमान चालीसा का पाठ करें।",
        "प्रतिदिन 'ॐ नमो भगवते वासुदेवाय' मन्त्र की १ माला जपें।",
        "पक्षियों को दाना और जल अर्पित करें।"
      ]
    };
  } else if (lang === "sa") {
    return {
      text: `हे ${personName}! भवतः कुण्डल्याधारेण ${lagnaName} लग्ने ${dashaName} काले धैर्येण ईश्वरशरणागत्या च सर्वविघ्नाः विनश्यन्ति।`,
      astrologicalInsight: `लग्नम्: ${lagnaName} • राशिः: ${rashiName} • दशा: ${dashaName}।`,
      gitaVerse: {
        chapter: "अध्यायः २, श्लोकः १४",
        sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।",
        translation: "सुखदुःखे समे कृत्वा तितिक्षां कुरु।"
      },
      remedies: [
        "हनुमानचालीसापाठः।",
        "नित्यं भगवद्गीतायाः श्लोकस्मरणम्।"
      ]
    };
  }

  return {
    text: `Dear ${personName}, analyzing your Janam Kundli (${kundli.lagna} Ascendant, ${kundli.rashi} Moon) and current ${kundli.currentDasha}, every life transition and apparent obstacle is an invitation for inner mastery and elevation. Align your efforts with Dharma.`,
    astrologicalInsight: `Ascendant: ${kundli.lagna} (${kundli.lagnaDegree}) • Moon: ${kundli.rashi} • Active Dasha: ${kundli.currentDasha}.`,
    gitaVerse: {
      chapter: "Chapter 2, Verse 14",
      sanskrit: "Matra-sparsas tu kaunteya sitosna-sukha-duhkha-dah",
      translation: "The nonpermanent appearance of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons. Learn to tolerate them without being disturbed."
    },
    remedies: [
      "Chant the Maha Mrityunjaya Mantra or Hanuman Chalisa to dispel fear and obstacles.",
      "Recite 108 chants of 'Om Namo Bhagavate Vasudevaya' daily for divine protection.",
      "Feed birds and provide clean water daily as a gentle Vedic remedy."
    ]
  };
}

/**
 * Ask the AI Vedic Astrologer & Gita Bot
 */
export async function askVedicBot(
  question: string,
  kundli: KundliData,
  personName: string,
  lang: "en" | "hi" | "sa" = "en",
  previousMessages: VedicBotMessage[] = []
): Promise<VedicBotMessage> {
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // Try Gemini AI first if API key is present
  if (geminiApiKey && geminiApiKey.trim() !== "" && geminiApiKey !== "your-gemini-api-key") {
    try {
      const isHindiOrSanskrit = lang === "hi" || lang === "sa";
      
      const planetsSummary = kundli.planets
        .map((p) => {
          const pName = isHindiOrSanskrit
            ? (lang === "sa" ? PLANET_NAME_SA[p.planet] || p.sanskritName : PLANET_NAME_HI[p.planet] || p.sanskritName)
            : p.planet;
          const rName = isHindiOrSanskrit ? p.rashiSanskrit : p.rashi;
          const hName = isHindiOrSanskrit ? `${p.house}वें भाव` : `House ${p.house}`;
          return `${pName} in ${hName} (${rName}, ${p.degree})`;
        })
        .join(", ");

      const lagnaName = isHindiOrSanskrit ? (kundli.lagnaSanskrit || kundli.lagna) : kundli.lagna;
      const rashiName = isHindiOrSanskrit ? (kundli.rashiSanskrit || kundli.rashi) : kundli.rashi;
      const sunSignName = isHindiOrSanskrit ? (kundli.sunSignSanskrit || kundli.sunSign) : kundli.sunSign;
      const nakshatraName = isHindiOrSanskrit ? (kundli.nakshatraSanskrit || kundli.nakshatra) : kundli.nakshatra;
      const dashaName = isHindiOrSanskrit ? (kundli.currentDashaSanskrit || kundli.currentDasha) : kundli.currentDasha;

      const systemPrompt = `
You are a revered, deeply compassionate Vedic Jyotish Acharya (वेदिक ज्योतिषाचार्य) and Bhagavad Gita philosopher.
You are counseling ${personName} based on their authentic Sidereal Janam Kundli chart:
- Ascendant (लग्न): ${lagnaName} (${kundli.lagnaDegree})
- Moon Sign (चन्द्र राशि): ${rashiName} (Lord: ${kundli.rashiLord})
- Sun Sign (सूर्य राशि): ${sunSignName} (${kundli.sunDegree})
- Nakshatra (नक्षत्र): ${nakshatraName} (Pada ${kundli.pada}, Lord: ${kundli.nakshatraLord})
- Active Dasha (दशा): ${dashaName}
- Planetary Placements (ग्रह स्थिति): ${planetsSummary}

User's Question: "${question}"
Response Language: ${lang === "hi" ? "Hindi (हिन्दी)" : lang === "sa" ? "Sanskrit (संस्कृतम्)" : "English"}

CRITICAL LANGUAGE & PLANET NAME INSTRUCTIONS:
- You MUST write your ENTIRE response in ${lang === "hi" ? "Hindi (हिन्दी)" : lang === "sa" ? "Sanskrit (संस्कृतम्)" : "English"}.
- If the language is Hindi or Sanskrit:
  * NEVER use English planet names ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu").
  * ALWAYS use pure traditional Vedic names: सूर्य / सूर्यदेव, चन्द्र / चन्द्रदेव, मंगल / भौम, बुध, गुरु / बृहस्पति, शुक्र, शनि / शनिदेव, राहु, केतु.
  * NEVER use English words for houses ("House 1", "7th house"). Use प्रथम भाव, द्वितीय भाव, सप्तम भाव, दशम भाव.
  * Rashis MUST be in Hindi/Sanskrit: मेष, वृषभ, मिथुन, कर्क, सिंह, कन्या, तुला, वृश्चिक, धनु, मकर, कुम्भ, मीन.

Give a warm, empowering, highly personalized astrological reading that directly references their houses/planets, followed by a specific Bhagavad Gita shloka and practical Vedic remedies.

Return strictly valid JSON in this exact structure without markdown backticks:
{
  "text": "<Compassionate 2-4 sentence Vedic counsel directly answering their question based on their chart>",
  "astrologicalInsight": "<1-2 sentences highlighting the relevant House, ruling Graha, and transit impact>",
  "gitaVerse": {
    "chapter": "<e.g. Chapter 2, Verse 47 or अध्याय २, श्लोक ४७>",
    "sanskrit": "<Authentic Sanskrit verse line>",
    "translation": "<Practical translation tailored to their question>"
  },
  "remedies": [
    "<Vedic remedy 1: Mantra / Chanting>",
    "<Vedic remedy 2: Mindset / Karma Yoga practice>",
    "<Vedic remedy 3: Auspicious charity or day observance>"
  ]
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
          return {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: parsed.text || "May Lord Krishna illuminate your path with wisdom and clarity.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            astrologicalInsight: parsed.astrologicalInsight,
            gitaVerse: parsed.gitaVerse,
            remedies: parsed.remedies || [],
          };
        }
      }
    } catch (err) {
      console.warn("Gemini AI API error in askVedicBot, using authentic offline Vedic engine", err);
    }
  }

  // Deterministic Offline Vedic Fallback
  const offlineData = generateOfflineVedicAnswer(question, kundli, personName, lang);
  return {
    id: `bot-${Date.now()}`,
    sender: "bot",
    text: offlineData.text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    astrologicalInsight: offlineData.astrologicalInsight,
    gitaVerse: offlineData.gitaVerse,
    remedies: offlineData.remedies,
  };
}

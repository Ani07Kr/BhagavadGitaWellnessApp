import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Rect, Line, Polygon, Text as SvgText, G } from "react-native-svg";
import { useTheme } from "@/context/theme";
import { Sparkles } from "lucide-react-native";

export interface HouseData {
  houseNumber: number; // 1 to 12
  rashiNumber?: number; // 1 to 12 (Aries=1, Pisces=12)
  rashiName?: string;
  planets: string[];
}

interface NorthIndianKundliChartProps {
  houses: { [key: number]: string[] }; // House 1..12 -> Planet names
  lagnaRashiIndex?: number; // 0 to 11 (0=Aries, 11=Pisces)
  lagnaName?: string;
  title?: string;
  subtitle?: string;
}

const BHAVA_SIGNIFICANCES = [
  { house: 1, name: "1st House: Tanu Bhava (तनु भाव / लग्न)", meaning: "Self, Physical Body, Vitality, Personality, Constitution & Ascendant" },
  { house: 2, name: "2nd House: Dhana Bhava (धन भाव)", meaning: "Wealth, Family, Speech, Assets, Liquid Savings & Food" },
  { house: 3, name: "3rd House: Sahaja Bhava (सहज भाव)", meaning: "Siblings, Courage, Communication, Short Journeys, Skills & Effort" },
  { house: 4, name: "4th House: Sukha Bhava (सुख भाव)", meaning: "Mother, Vehicles, Home, Land, Happiness, Heart & Peace of Mind" },
  { house: 5, name: "5th House: Putra Bhava (पुत्र भाव)", meaning: "Children, Intelligence, Creativity, Past Life Merits (Purva Punya) & Mantras" },
  { house: 6, name: "6th House: Ripu/Shatru Bhava (शत्रु भाव)", meaning: "Enemies, Debts, Diseases, Daily Routine, Competitions & Service" },
  { house: 7, name: "7th House: Kalatra/Jaya Bhava (जाया भाव)", meaning: "Spouse, Marriage, Partnerships, Foreign Travel & Public Relations" },
  { house: 8, name: "8th House: Ayur/Randhra Bhava (आयु भाव)", meaning: "Longevity, Transformation, Hidden Knowledge, Occult & Research" },
  { house: 9, name: "9th House: Dharma/Bhagya Bhava (भाग्य भाव)", meaning: "Fortune, Higher Wisdom, Guru, Father, Pilgrimages & Righteousness" },
  { house: 10, name: "10th House: Karma/Rajya Bhava (कर्म भाव)", meaning: "Career, Fame, Social Status, Authority, Leadership & Accomplishments" },
  { house: 11, name: "11th House: Labha/Aya Bhava (लाभ भाव)", meaning: "Gains, Prosperity, Elder Siblings, Aspirations, Wealth & Friends" },
  { house: 12, name: "12th House: Vyaya/Moksha Bhava (मोक्ष भाव)", meaning: "Expenditure, Foreign Settlement, Isolation, Spiritual Liberation & Sleep" },
];

export default function NorthIndianKundliChart({
  houses,
  lagnaRashiIndex = 0,
  lagnaName,
  title = "Janam Kundli (जन्म कुंडली)",
  subtitle = "North Indian Style Diamond Chart (उत्तर भारतीय चक्र)",
}: NorthIndianKundliChartProps) {
  const { colors } = useTheme();
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  const SIZE = 340;
  const HALF = 170; // SIZE / 2

  // Clean Sanskrit shorthand for Grahas
  const formatPlanetShort = (p: string): string => {
    if (p.includes("Sun") || p.includes("सूर्य") || p.includes("सू")) return "सूर्य";
    if (p.includes("Moon") || p.includes("चन्द्र") || p.includes("चं")) return "चन्द्र";
    if (p.includes("Mars") || p.includes("मङ्गल") || p.includes("मंगल") || p.includes("भौम")) return "मङ्गल";
    if (p.includes("Merc") || p.includes("बुध")) return "बुध";
    if (p.includes("Jup") || p.includes("गुरु") || p.includes("बृहस्पति")) return "गुरु";
    if (p.includes("Ven") || p.includes("शुक्र")) return "शुक्र";
    if (p.includes("Sat") || p.includes("शनि")) return "शनि";
    if (p.includes("Rahu") || p.includes("राहु")) return "राहु";
    if (p.includes("Ketu") || p.includes("केतु")) return "केतु";
    return p.substring(0, 4);
  };

  // Mathematically calculated non-overlapping coordinates inside each compartment
  const HOUSE_CONFIG: {
    [key: number]: {
      rashiX: number;
      rashiY: number;
      planetX: number;
      planetY: number;
    };
  } = {
    // 1st House: Center-Top Diamond (Lagna)
    1: {
      rashiX: HALF,
      rashiY: 138,
      planetX: HALF,
      planetY: 72,
    },
    // 2nd House: Top-Left Triangle
    2: {
      rashiX: 130,
      rashiY: 34,
      planetX: 62,
      planetY: 44,
    },
    // 3rd House: Left-Upper Triangle
    3: {
      rashiX: 34,
      rashiY: 130,
      planetX: 44,
      planetY: 62,
    },
    // 4th House: Center-Left Diamond (Sukha)
    4: {
      rashiX: 138,
      rashiY: HALF,
      planetX: 72,
      planetY: HALF - 10,
    },
    // 5th House: Left-Lower Triangle
    5: {
      rashiX: 34,
      rashiY: SIZE - 130,
      planetX: 44,
      planetY: SIZE - 62,
    },
    // 6th House: Bottom-Left Triangle
    6: {
      rashiX: 130,
      rashiY: SIZE - 34,
      planetX: 62,
      planetY: SIZE - 44,
    },
    // 7th House: Center-Bottom Diamond (Kalatra)
    7: {
      rashiX: HALF,
      rashiY: HALF + 32,
      planetX: HALF,
      planetY: SIZE - 72,
    },
    // 8th House: Bottom-Right Triangle
    8: {
      rashiX: SIZE - 130,
      rashiY: SIZE - 34,
      planetX: SIZE - 62,
      planetY: SIZE - 44,
    },
    // 9th House: Right-Lower Triangle
    9: {
      rashiX: SIZE - 34,
      rashiY: SIZE - 130,
      planetX: SIZE - 44,
      planetY: SIZE - 62,
    },
    // 10th House: Center-Right Diamond (Karma)
    10: {
      rashiX: HALF + 32,
      rashiY: HALF,
      planetX: SIZE - 72,
      planetY: HALF - 10,
    },
    // 11th House: Right-Upper Triangle
    11: {
      rashiX: SIZE - 34,
      rashiY: 130,
      planetX: SIZE - 44,
      planetY: 62,
    },
    // 12th House: Top-Right Triangle
    12: {
      rashiX: SIZE - 130,
      rashiY: 34,
      planetX: SIZE - 62,
      planetY: 44,
    },
  };

  const activeBhava = BHAVA_SIGNIFICANCES.find((b) => b.house === selectedHouse) || BHAVA_SIGNIFICANCES[0];
  const activePlanets = houses[selectedHouse] || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {/* Title Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <View style={[styles.ganeshBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.ganeshText, { color: colors.primary }]}>卐 ॐ श्री 卐</Text>
        </View>
      </View>

      {/* SVG North Indian Diamond Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Outer Sacred Golden Frame */}
          <Rect
            x="2"
            y="2"
            width={SIZE - 4}
            height={SIZE - 4}
            fill="#FEF3C7"
            stroke="#92400E"
            strokeWidth="3.5"
            rx="6"
          />

          {/* Diagonal Lines (Corner to Corner) */}
          <Line x1="2" y1="2" x2={SIZE - 2} y2={SIZE - 2} stroke="#92400E" strokeWidth="2.5" />
          <Line x1={SIZE - 2} y1="2" x2="2" y2={SIZE - 2} stroke="#92400E" strokeWidth="2.5" />

          {/* Inner Diamond (Connecting Midpoints) */}
          <Polygon
            points={`${HALF},2 ${SIZE - 2},${HALF} ${HALF},${SIZE - 2} 2,${HALF}`}
            fill="#FFFBEB"
            stroke="#92400E"
            strokeWidth="3"
          />

          {/* 1st House Top Sacred Header: 'लग्न (Asc)' */}
          <SvgText
            x={HALF}
            y={32}
            fill="#B45309"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            लग्न
          </SvgText>

          {/* Render 12 Houses (Only Rashi Numbers & Placed Planets - ZERO OVERLAP) */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
            const config = HOUSE_CONFIG[houseNum];
            const rashiNumber = ((lagnaRashiIndex + houseNum - 1) % 12) + 1;
            const planetList = houses[houseNum] || [];
            const isSelected = selectedHouse === houseNum;

            return (
              <G key={`house-${houseNum}`}>
                {/* Traditional Rashi Number in House */}
                <SvgText
                  x={config.rashiX}
                  y={config.rashiY}
                  fill={isSelected ? "#B45309" : "#92400E"}
                  fontSize="13"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {rashiNumber}
                </SvgText>

                {/* Planets placed in this house (Centered with proper line-height) */}
                {planetList.slice(0, 3).map((planet, pIdx) => {
                  const shortName = formatPlanetShort(planet);
                  // Multi-planet vertical offset
                  const offsetY =
                    planetList.length === 1
                      ? 0
                      : planetList.length === 2
                      ? (pIdx - 0.5) * 16
                      : (pIdx - 1) * 15;

                  return (
                    <SvgText
                      key={`p-${pIdx}`}
                      x={config.planetX}
                      y={config.planetY + offsetY}
                      fill="#0F172A"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {shortName}
                    </SvgText>
                  );
                })}
              </G>
            );
          })}
        </Svg>
      </View>

      {/* House Selector Buttons Strip */}
      <View style={styles.houseSelectorRow}>
        <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>
          Inspect House (भाव विवरण):
        </Text>
        <View style={styles.houseChipsGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
            const isSel = selectedHouse === h;
            return (
              <TouchableOpacity
                key={h}
                style={[
                  styles.houseChip,
                  {
                    backgroundColor: isSel ? colors.primary : colors.background,
                    borderColor: isSel ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedHouse(h)}
              >
                <Text
                  style={[
                    styles.houseChipText,
                    { color: isSel ? "#fff" : colors.text, fontWeight: isSel ? "700" : "500" },
                  ]}
                >
                  {h === 1 ? "H1 (लग्न)" : `H${h}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected House Deep-Dive Card */}
      <View style={[styles.bhavaDetailCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.bhavaTopRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.bhavaTitle, { color: colors.primary }]}>
              {activeBhava.name}
            </Text>
          </View>
          <View style={[styles.bhavaRashiBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.bhavaRashiText, { color: colors.primary }]}>
              Rashi {((lagnaRashiIndex + selectedHouse - 1) % 12) + 1}
            </Text>
          </View>
        </View>

        <Text style={[styles.bhavaMeaning, { color: colors.text }]}>
          {activeBhava.meaning}
        </Text>

        <View style={[styles.bhavaPlanetsBox, { borderTopColor: colors.border }]}>
          <Text style={[styles.bhavaPlanetsLabel, { color: colors.textSecondary }]}>
            Grahas in this Bhava (इस भाव में स्थित ग्रह):
          </Text>
          <Text style={[styles.bhavaPlanetsValue, { color: colors.primary }]}>
            {activePlanets.length > 0 ? activePlanets.join(", ") : "No Planets (रिक्त भाव)"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  ganeshBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  ganeshText: {
    fontSize: 11,
    fontWeight: "800",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  houseSelectorRow: {
    marginTop: 12,
    marginBottom: 10,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  houseChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between",
  },
  houseChip: {
    width: "23%",
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  houseChipText: {
    fontSize: 11,
  },
  bhavaDetailCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  bhavaTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bhavaTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  bhavaRashiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bhavaRashiText: {
    fontSize: 10,
    fontWeight: "800",
  },
  bhavaMeaning: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  bhavaPlanetsBox: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  bhavaPlanetsLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },
  bhavaPlanetsValue: {
    fontSize: 13,
    fontWeight: "700",
  },
});

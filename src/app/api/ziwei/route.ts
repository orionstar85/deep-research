import { NextResponse, type NextRequest } from "next/server";
import {
  calculateChart,
  BirthData,
  getPalaceInterpretation,
  getStarInterpretation,
  formatLunarDate,
} from "@/utils/ziwei/calculator";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const preferredRegion = [
  "cle1",
  "iad1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
  "hnd1",
  "kix1",
];

/**
 * POST /api/ziwei
 * Calculate Zi Wei Dou Shu chart based on birth data
 */
export async function POST(req: NextRequest) {
  try {
    const body: BirthData = await req.json();

    // Validate required fields
    if (!body.name || !body.gender || !body.birthDate || !body.birthTime) {
      return NextResponse.json(
        {
          code: 400,
          message: "Missing required fields: name, gender, birthDate, birthTime",
        },
        { status: 400 }
      );
    }

    // Calculate the chart
    const chart = calculateChart(body);

    // Generate interpretation summary
    const palaceInterpretations = chart.palaces.map((palace) => ({
      palace: palace.name,
      branch: palace.branch,
      interpretation: getPalaceInterpretation(palace.name),
      stars: [
        ...palace.mainStars.map((s) => ({
          ...s,
          interpretation: getStarInterpretation(s.name),
        })),
        ...palace.auxiliaryStars.map((s) => ({
          ...s,
          interpretation: null, // Auxiliary stars don't have detailed interpretations in this version
        })),
      ],
    }));

    const response = {
      code: 200,
      data: {
        // Birth information
        birthData: chart.birthData,
        
        // Lunar calendar information
        lunarDate: {
          ...chart.lunarDate,
          formatted: formatLunarDate(chart.lunarDate),
        },
        
        // Year information
        yearStem: chart.yearStem,
        yearBranch: chart.yearBranch,
        
        // Chart structure
        lifePalace: {
          index: chart.lifePalace,
          name: chart.palaces[chart.lifePalace].name,
          branch: chart.palaces[chart.lifePalace].branch,
          isLifePalace: true,
        },
        bodyPalace: {
          index: chart.bodyPalace,
          name: chart.palaces[chart.bodyPalace].name,
          branch: chart.palaces[chart.bodyPalace].branch,
          isBodyPalace: true,
        },
        
        // Five element information
        fiveElement: chart.fiveElement,
        elementNumber: chart.elementNumber,
        yinYang: chart.yinYang,
        
        // All 12 palaces with stars
        palaces: chart.palaces.map((palace) => ({
          index: palace.index,
          name: palace.name,
          branch: palace.branch,
          isLifePalace: palace.isLifePalace,
          isBodyPalace: palace.isBodyPalace,
          mainStars: palace.mainStars,
          auxiliaryStars: palace.auxiliaryStars,
          minorStars: palace.minorStars,
        })),
        
        // Interpretations
        interpretations: palaceInterpretations,
        
        // Summary
        summary: generateSummary(chart),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("ZiWei calculation error:", error);
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate chart summary based on key palaces
 */
function generateSummary(chart: ReturnType<typeof calculateChart>): {
  lifePalace: string;
  career: string;
  wealth: string;
  relationships: string;
  health: string;
  overall: string;
} {
  const lifePalace = chart.palaces[chart.lifePalace];
  const careerPalace = chart.palaces[8]; // 官禄
  const wealthPalace = chart.palaces[4]; // 财帛
  const spousePalace = chart.palaces[2]; // 夫妻
  const healthPalace = chart.palaces[5]; // 疾厄

  // Get main stars in key palaces
  const lifeMainStar = lifePalace.mainStars[0]?.name || "無主星";
  const careerMainStar = careerPalace.mainStars[0]?.name || "無主星";
  const wealthMainStar = wealthPalace.mainStars[0]?.name || "無主星";
  const spouseMainStar = spousePalace.mainStars[0]?.name || "無主星";

  return {
    lifePalace: `命宮主星為${lifeMainStar}，${getStarInterpretation(lifeMainStar).slice(0, 50)}...`,
    career: `事業宮主星為${careerMainStar}，${getStarInterpretation(careerMainStar).slice(0, 50)}...`,
    wealth: `財帛宮主星為${wealthMainStar}，${getStarInterpretation(wealthMainStar).slice(0, 50)}...`,
    relationships: `夫妻宮主星為${spouseMainStar}，${getStarInterpretation(spouseMainStar).slice(0, 50)}...`,
    health: `疾厄宮有${healthPalace.mainStars.length > 0 ? healthPalace.mainStars[0].name : "無主星"}，注意身體調養。`,
    overall: `五行屬${chart.fiveElement}局，${chart.yinYang}性${chart.birthData.gender === 'male' ? '男命' : '女命'}。`,
  };
}

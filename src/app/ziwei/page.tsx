"use client";

import { useState } from "react";
import { Sparkles, Star } from "lucide-react";
import InputForm from "@/components/ZiWei/InputForm";
import ChartDisplay from "@/components/ZiWei/ChartDisplay";
import { BirthData } from "@/utils/ziwei/calculator";

import { streamText } from "ai";
import useModelProvider from "@/hooks/useAiProvider";

interface ChartResponse {
  code: number;
  data: {
    lunarDate: {
      year: number;
      month: number;
      day: number;
      formatted: string;
    };
    yearStem: string;
    yearBranch: string;
    lifePalace: {
      index: number;
      name: string;
      branch: string;
    };
    bodyPalace: {
      index: number;
      name: string;
      branch: string;
    };
    fiveElement: string;
    elementNumber: number;
    yinYang: string;
    palaces: {
      index: number;
      name: string;
      branch: string;
      isLifePalace?: boolean;
      isBodyPalace?: boolean;
      mainStars: { name: string; type: string; brightness: number }[];
      auxiliaryStars: { name: string; type: string }[];
      minorStars: { name: string; type: string }[];
    }[];
    interpretations: {
      palace: string;
      branch: string;
      interpretation: string;
      stars: { name: string; type: string; interpretation?: string | null }[];
    }[];
    summary: {
      lifePalace: string;
      career: string;
      wealth: string;
      relationships: string;
      health: string;
      overall: string;
    };
    birthData: BirthData;
  };
}

export default function ZiWeiPage() {
  const [chartData, setChartData] = useState<ChartResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string>("");
  const { createModelProvider, getModel } = useModelProvider();

  const handleSubmit = async (data: BirthData) => {
    setIsLoading(true);
    setAiInterpretation("");
    
    try {
      const response = await fetch("/api/ziwei", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate chart");
      }

      const result: ChartResponse = await response.json();
      
      if (result.code === 200) {
        setChartData(result.data);
        // Start AI interpretation
        await generateAIInterpretation(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("排盘失败，请检查输入数据");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIInterpretation = async (data: ChartResponse["data"]) => {
    setIsInterpreting(true);
    
    try {
      const { networkingModel } = getModel();
      const model = await createModelProvider(networkingModel);
      
      const prompt = `你是一位精通紫微斗數的命理大師。請為以下命盤進行深度解析：

命主信息：
- 姓名：${data.birthData.name}
- 性别：${data.birthData.gender === 'male' ? '男' : '女'}
- 出生日期：${data.lunarDate.formatted}
- 年干支：${data.yearStem}${data.yearBranch}年
- 五行局：${data.fiveElement}局
- 陰陽：${data.yinYang}

命盤結構：
- 命宮：${data.lifePalace.name} (${data.lifePalace.branch})
- 身宮：${data.bodyPalace.name} (${data.bodyPalace.branch})

十二宮主星分布：
${data.palaces.map(p => {
  const stars = [...p.mainStars, ...p.auxiliaryStars].map(s => s.name).join('、');
  return `${p.name}(${p.branch})：${stars || '無主星'}`;
}).join('\n')}

請提供：
1. 命宮主星組合的性格特質分析（詳細）
2. 事業發展方向與財運分析
3. 感情婚姻狀況預測
4. 健康狀況與建議
5. 今年(${data.birthData.predictionYear})流年運勢簡析

請以傳統紫微斗數術語為主，用繁體中文回答，語氣專業而親切，總字數約 800-1000 字。`;

      const result = streamText({
        model,
        system: "你是紫微斗數命理大師，精通十四主星、輔星、四化等傳統命理學說。請以專業、詳細、有深度的風格分析命盤。",
        prompt,
      });

      let interpretation = "";
      for await (const chunk of result.textStream) {
        interpretation += chunk;
        setAiInterpretation(interpretation);
      }
    } catch (error) {
      console.error("AI interpretation error:", error);
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-red-900 flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-amber-600" />
            紫微斗数 AI 智能排盘
            <Sparkles className="w-8 h-8 text-amber-600" />
          </h1>
          <p className="text-amber-800/70 text-lg flex items-center justify-center gap-2">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-amber-700/50"></span>
            探寻星辰奥秘，洞见生命真谛
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-amber-700/50"></span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Input Form */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-red-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                缘主信息
              </h2>
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Content - Chart Display */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 p-6 min-h-[600px]">
              {!chartData ? (
                <div className="h-full flex flex-col items-center justify-center text-amber-700/50 py-20">
                  <div className="w-24 h-24 bg-amber-100/50 rounded-full flex items-center justify-center mb-6">
                    <Star className="w-12 h-12 text-amber-400/50" />
                  </div>
                  <p className="text-lg">请在左侧输入生辰信息，开启命理推演</p>
                  <p className="text-sm mt-2 opacity-70">紫微斗数 · 传承经典 · 智慧洞见</p>
                </div>
              ) : (
                <ChartDisplay
                  chartData={chartData}
                  aiInterpretation={aiInterpretation}
                  isInterpreting={isInterpreting}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-amber-700/60 text-sm py-8 border-t border-amber-200/30">
          <p>© 2026 紫微斗数 AI 智能排盘系统 · 传承经典 智慧洞见</p>
          <p className="mt-1 text-xs opacity-70">本系统采用传统安星法，结合人工智能进行命理分析</p>
        </footer>
      </div>
    </div>
  );
}

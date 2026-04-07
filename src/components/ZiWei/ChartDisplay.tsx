"use client";

import { cn } from "@/utils/style";
import { Sparkles, Star, Crown, Building2, Users, Heart, Baby, Coins, Activity, Plane, UserCircle2, Briefcase, Home, Smile, Shield } from "lucide-react";

interface ChartDisplayProps {
  chartData: {
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
  };
  aiInterpretation?: string;
  isInterpreting?: boolean;
}

const PALACE_ICONS: Record<string, React.ReactNode> = {
  '命宫': <Crown className="w-4 h-4" />,
  '兄弟': <Users className="w-4 h-4" />,
  '夫妻': <Heart className="w-4 h-4" />,
  '子女': <Baby className="w-4 h-4" />,
  '财帛': <Coins className="w-4 h-4" />,
  '疾厄': <Activity className="w-4 h-4" />,
  '迁移': <Plane className="w-4 h-4" />,
  '仆役': <UserCircle2 className="w-4 h-4" />,
  '官禄': <Briefcase className="w-4 h-4" />,
  '田宅': <Home className="w-4 h-4" />,
  '福德': <Smile className="w-4 h-4" />,
  '父母': <Shield className="w-4 h-4" />,
};



export default function ChartDisplay({ chartData, aiInterpretation, isInterpreting }: ChartDisplayProps) {
  const { palaces, lifePalace, bodyPalace, lunarDate, yearStem, yearBranch, fiveElement, yinYang, summary } = chartData;

  // Organize palaces in the traditional Zi Wei layout
  // The chart is arranged with Life Palace at the bottom (or specific position based on month)
  const getPalacePosition = (palaceIndex: number) => {
    // Map palace index to grid position (4x4 layout with center empty)
    // Standard layout:
    // [巳][午][未][申]
    // [辰]      [酉]
    // [卯]      [戌]
    // [寅][丑][子][亥]
    
    const positions = [
      { row: 3, col: 3 }, // 亥 (11) - bottom right
      { row: 3, col: 2 }, // 子 (0) - bottom
      { row: 3, col: 1 }, // 丑 (1) - bottom left middle
      { row: 3, col: 0 }, // 寅 (2) - bottom left
      { row: 2, col: 0 }, // 卯 (3) - left
      { row: 1, col: 0 }, // 辰 (4) - left top
      { row: 0, col: 0 }, // 巳 (5) - top left
      { row: 0, col: 1 }, // 午 (6) - top
      { row: 0, col: 2 }, // 未 (7) - top right middle
      { row: 0, col: 3 }, // 申 (8) - top right
      { row: 1, col: 3 }, // 酉 (9) - right
      { row: 2, col: 3 }, // 戌 (10) - right bottom
    ];
    
    return positions[palaceIndex];
  };

  const renderPalace = (palace: typeof palaces[0]) => {
    const pos = getPalacePosition(palace.index);
    const isLife = palace.isLifePalace;
    const isBody = palace.isBodyPalace;
    
    return (
      <div
        key={palace.index}
        className={cn(
          "border border-amber-800/30 bg-amber-50/40 rounded-lg p-2",
          "flex flex-col min-h-[120px] relative overflow-hidden",
          isLife && "ring-2 ring-red-600 bg-red-50/60",
          isBody && "ring-2 ring-blue-600 bg-blue-50/60"
        )}
        style={{
          gridRow: pos.row + 1,
          gridColumn: pos.col + 1,
        }}
      >
        {/* Palace Header */}
        <div className="flex items-center justify-between mb-1 border-b border-amber-800/20 pb-1">
          <div className="flex items-center gap-1 text-xs font-bold text-red-900">
            {PALACE_ICONS[palace.name] || <Building2 className="w-4 h-4" />}
            <span>{palace.name}</span>
          </div>
          <div className="flex gap-1">
            {isLife && (
              <span className="text-[10px] bg-red-600 text-white px-1 rounded">
                命
              </span>
            )}
            {isBody && (
              <span className="text-[10px] bg-blue-600 text-white px-1 rounded">
                身
              </span>
            )}
            <span className="text-[10px] text-amber-700 bg-amber-100/50 px-1 rounded">
              {palace.branch}
            </span>
          </div>
        </div>
        
        {/* Stars */}
        <div className="flex-1 flex flex-col gap-0.5 text-[10px] leading-tight">
          {/* Main Stars */}
          {palace.mainStars.map((star, idx) => (
            <div key={idx} className="text-red-700 font-semibold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-600" />
              {star.name}
            </div>
          ))}
          
          {/* Auxiliary Stars */}
          {palace.auxiliaryStars.slice(0, 2).map((star, idx) => (
            <div key={idx} className="text-blue-700 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-blue-500" />
              {star.name}
            </div>
          ))}
          
          {/* Minor Stars (show count if many) */}
          {palace.minorStars.length > 0 && (
            <div className="text-gray-500 flex flex-wrap gap-1 mt-0.5">
              {palace.minorStars.slice(0, 3).map((star, idx) => (
                <span key={idx} className="text-[9px]">{star.name}</span>
              ))}
              {palace.minorStars.length > 3 && (
                <span className="text-[9px] text-gray-400">+{palace.minorStars.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-red-900/10 via-amber-100/50 to-red-900/10 rounded-lg p-4 border border-amber-800/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-amber-700">农历</div>
            <div className="font-bold text-red-900">{lunarDate.formatted}</div>
          </div>
          <div>
            <div className="text-xs text-amber-700">年干支</div>
            <div className="font-bold text-red-900">{yearStem}{yearBranch}年</div>
          </div>
          <div>
            <div className="text-xs text-amber-700">五行局</div>
            <div className="font-bold text-red-900">{fiveElement}局</div>
          </div>
          <div>
            <div className="text-xs text-amber-700">阴阳</div>
            <div className="font-bold text-red-900">{yinYang}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-800/20">
          <div className="text-center">
            <div className="text-xs text-red-600">命宫</div>
            <div className="font-bold text-red-900">{lifePalace.name} ({lifePalace.branch})</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-blue-600">身宫</div>
            <div className="font-bold text-blue-900">{bodyPalace.name} ({bodyPalace.branch})</div>
          </div>
        </div>
      </div>

      {/* 12 Palaces Grid - Traditional Layout */}
      <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-800/20">
        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          十二宫命盘
        </h3>
        
        {/* 4x4 Grid with center empty */}
        <div className="grid grid-cols-4 gap-2 aspect-square max-w-3xl mx-auto">
          {palaces.map(renderPalace)}
          {/* Center Info */}
          <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex items-center justify-center">
            <div className="text-center p-4 bg-gradient-to-br from-red-100/50 to-amber-100/50 rounded-full border-2 border-red-800/30 w-32 h-32 flex flex-col items-center justify-center">
              <span className="text-xs text-amber-700">{yearStem}{yearBranch}</span>
              <span className="text-sm font-bold text-red-900">{fiveElement}局</span>
              <span className="text-xs text-amber-600">{yinYang}性</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50/50 p-4 rounded-lg border border-red-200/50">
          <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <Crown className="w-4 h-4" /> 命宫概况
          </h4>
          <p className="text-sm text-gray-700">{summary.lifePalace}</p>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200/50">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> 事业运势
          </h4>
          <p className="text-sm text-gray-700">{summary.career}</p>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" /> 财运分析
          </h4>
          <p className="text-sm text-gray-700">{summary.wealth}</p>
        </div>
        <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-200/50">
          <h4 className="font-bold text-pink-900 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" /> 感情婚姻
          </h4>
          <p className="text-sm text-gray-700">{summary.relationships}</p>
        </div>
      </div>

      {/* AI Interpretation */}
      {isInterpreting && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="font-semibold text-purple-900">AI 正在解析命盘...</span>
          </div>
          <div className="h-2 bg-purple-200/50 rounded overflow-hidden">
            <div className="h-full bg-purple-500 w-1/3 animate-pulse" />
          </div>
        </div>
      )}

      {aiInterpretation && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200/50">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI 智能命盘详解
          </h3>
          <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
            {aiInterpretation}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/style";
import { format } from "date-fns";


import { CalendarIcon, Sparkles, User, Clock, Calendar as CalendarIcon2, Loader2, AlertCircle } from "lucide-react";
import { BirthData } from "@/utils/ziwei/calculator";

interface InputFormProps {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

// Chinese hour options with traditional time ranges
// Note: 子时 (Zi hour) spans 23:00-01:00 but in traditional calculation:
// - 23:00-23:59 belongs to the NEXT day's Zi hour
// - 00:00-00:59 belongs to the CURRENT day's Zi hour
const TIME_OPTIONS = [
  { value: "00:00", label: "子时 (00:00-00:59)", description: "当日子时" },
  { value: "23:00", label: "子时 (23:00-23:59)", description: "次日子时", isNextDay: true },
  { value: "01:00", label: "丑时 (01:00-03:00)" },
  { value: "03:00", label: "寅时 (03:00-05:00)" },
  { value: "05:00", label: "卯时 (05:00-07:00)" },
  { value: "07:00", label: "辰时 (07:00-09:00)" },
  { value: "09:00", label: "巳时 (09:00-11:00)" },
  { value: "11:00", label: "午时 (11:00-13:00)" },
  { value: "13:00", label: "未时 (13:00-15:00)" },
  { value: "15:00", label: "申时 (15:00-17:00)" },
  { value: "17:00", label: "酉时 (17:00-19:00)" },
  { value: "19:00", label: "戌时 (19:00-21:00)" },
  { value: "21:00", label: "亥时 (21:00-23:00)" },
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [date, setDate] = useState<Date>();
  const [birthTime, setBirthTime] = useState("12:00");
  const [predictionYear, setPredictionYear] = useState(new Date().getFullYear());
  const [showZiHourWarning, setShowZiHourWarning] = useState(false);

  const handleTimeSelect = useCallback((value: string) => {
    setBirthTime(value);
    
    // Show warning for 23:00 Zi hour (next day)
    const selectedOption = TIME_OPTIONS.find(opt => opt.value === value);
    setShowZiHourWarning(!!selectedOption?.isNextDay);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    // Check if 23:00 Zi hour is selected (belongs to next day)
    const selectedTime = TIME_OPTIONS.find(opt => opt.value === birthTime);
    let adjustedDate = new Date(date);
    
    if (selectedTime?.isNextDay) {
      // 23:00-23:59 Zi hour belongs to the NEXT day
      adjustedDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    }

    onSubmit({
      name,
      gender,
      birthDate: format(adjustedDate, "yyyy-MM-dd"),
      birthTime: selectedTime?.isNextDay ? "23:30" : birthTime, // Use 23:30 for calculation
      predictionYear,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 姓名 */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-red-900 flex items-center gap-2">
          <User className="w-4 h-4" />
          姓名
        </Label>
        <Input
          id="name"
          placeholder="请输入姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-amber-700/30 focus:border-red-800 focus:ring-red-800/20 bg-white/80"
        />
      </div>

      {/* 性别 */}
      <div className="space-y-2">
        <Label className="text-red-900">性别</Label>
        <RadioGroup
          value={gender}
          onValueChange={(v) => setGender(v as "male" | "female")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" className="border-amber-700/50 text-red-800" />
            <Label htmlFor="male" className="text-gray-700 cursor-pointer">男</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" className="border-amber-700/50 text-red-800" />
            <Label htmlFor="female" className="text-gray-700 cursor-pointer">女</Label>
          </div>
        </RadioGroup>
      </div>

      {/* 出生日期 */}
      <div className="space-y-2">
        <Label className="text-red-900 flex items-center gap-2">
          <CalendarIcon2 className="w-4 h-4" />
          出生日期 (公历)
          {showZiHourWarning && (
            <span className="text-xs text-amber-700 ml-1">(已自动+1日)</span>
          )}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal border-amber-700/30 hover:bg-amber-50/50",
                !date && "text-muted-foreground",
                showZiHourWarning && "border-amber-500 bg-amber-50/50"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "yyyy-MM-dd") : "选择日期"}
              {showZiHourWarning && (
                <span className="ml-auto text-xs text-amber-600">(+1日)</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
        {showZiHourWarning && (
          <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            选择23:00子时，日期将自动+1日进行计算
          </p>
        )}
      </div>

      {/* 出生时辰 */}
      <div className="space-y-2">
        <Label className="text-red-900 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          出生时辰
        </Label>
        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-amber-700/30 rounded-md p-2 bg-white/80">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTimeSelect(option.value)}
              className={cn(
                "px-2 py-2 text-sm rounded-md transition-all text-left flex flex-col",
                birthTime === option.value
                  ? "bg-red-800 text-white shadow-md"
                  : "hover:bg-amber-100/50 text-gray-700",
                option.isNextDay && "border-l-2 border-l-amber-500"
              )}
            >
              <span>{option.label}</span>
              {option.description && (
                <span className={cn(
                  "text-[10px]",
                  birthTime === option.value ? "text-red-100" : "text-amber-600"
                )}>
                  {option.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 预测年份 */}
      <div className="space-y-2">
        <Label className="text-red-900">预测年份 (流年)</Label>
        <Input
          type="number"
          value={predictionYear}
          onChange={(e) => setPredictionYear(Number(e.target.value))}
          min={1900}
          max={2100}
          className="border-amber-700/30 focus:border-red-800 focus:ring-red-800/20 bg-white/80"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !date || !name}
        className="w-full bg-red-800 hover:bg-red-900 text-white shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            排盘中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            开始排盘
          </>
        )}
      </Button>

      {/* Tips */}
      <div className="mt-6 p-4 bg-amber-50/80 rounded-lg border border-amber-200/50 text-sm text-amber-900/70">
        <p className="flex items-start gap-2">
          <span className="text-amber-600">●</span>
          <span>
            子时（23:00-01:00）已正确处理：
            <br/>• 00:00-00:59 为当日子时
            <br/>• 23:00-23:59 为次日子时
          </span>
        </p>
        <p className="flex items-start gap-2 mt-2">
          <span className="text-amber-600">●</span>
          <span>采用标准安星法，结合 Gemini AI 进行深度解析。</span>
        </p>
      </div>
    </form>
  );
}

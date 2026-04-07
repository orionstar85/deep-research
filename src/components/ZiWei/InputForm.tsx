"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/style";
import { format } from "date-fns";


import { CalendarIcon, Sparkles, User, Clock, Calendar as CalendarIcon2, Loader2 } from "lucide-react";
import { BirthData } from "@/utils/ziwei/calculator";

interface InputFormProps {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

const TIME_OPTIONS = [
  { value: "00:00", label: "子时 (23:00-01:00)" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      name,
      gender,
      birthDate: format(date, "yyyy-MM-dd"),
      birthTime,
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
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal border-amber-700/30 hover:bg-amber-50/50",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "yyyy-MM-dd") : "选择日期"}
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
      </div>

      {/* 出生时辰 */}
      <div className="space-y-2">
        <Label className="text-red-900 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          出生时辰
        </Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-amber-700/30 rounded-md p-2 bg-white/80">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setBirthTime(option.value)}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-all text-left",
                birthTime === option.value
                  ? "bg-red-800 text-white shadow-md"
                  : "hover:bg-amber-100/50 text-gray-700"
              )}
            >
              {option.label}
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
          <span>本系统自动处理子时（23:00-01:00）换日逻辑。</span>
        </p>
        <p className="flex items-start gap-2 mt-1">
          <span className="text-amber-600">●</span>
          <span>采用标准安星法，结合 Gemini AI 进行深度解析。</span>
        </p>
      </div>
    </form>
  );
}

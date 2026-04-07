/**
 * Zi Wei Dou Shu (紫微斗数) - Purple Star Astrology Calculator
 * 
 * This module implements the traditional Chinese astrological system:
 * - 12 Palaces (十二宫): Life, Siblings, Spouse, Children, Wealth, Health, Travel, Friends, Career, Property, Fortune, Parents
 * - Main Stars (主星): Zi Wei (紫微), Tian Ji (天机), etc.
 * - Auxiliary Stars (辅星): Tian Fu (天府), Tai Yin (太阴), etc.
 * - Five Elements (五行局): Metal, Wood, Water, Fire, Earth
 * - Yin/Yang and Gender logic
 */

export interface BirthData {
  name: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD format
  birthTime: string; // HH:mm format (24-hour)
  predictionYear?: number; // Year for fortune prediction
}

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  hourBranch: number; // 0-11 (Zi, Chou, Yin, Mao, Chen, Si, Wu, Wei, Shen, You, Xu, Hai)
}

export interface Palace {
  index: number; // 0-11
  name: string;
  branch: string; // Zi, Chou, Yin, etc.
  mainStars: Star[];
  auxiliaryStars: Star[];
  minorStars: Star[];
  element?: string;
  isBodyPalace?: boolean;
  isLifePalace?: boolean;
}

export interface Star {
  name: string;
  type: 'main' | 'auxiliary' | 'minor' | 'lucky' | 'unlucky';
  brightness: number; // 1-5 (brightest to dimmest)
  palaceIndex: number;
}

export interface ChartData {
  birthData: BirthData;
  lunarDate: LunarDate;
  lifePalace: number;
  bodyPalace: number;
  fiveElement: string;
  elementNumber: number;
  yinYang: string;
  palaces: Palace[];
  mainStars: Star[];
  allStars: Star[];
  mingIndex: number; // Life palace index
  shenIndex: number; // Body palace index
  yearStem: string;
  yearBranch: string;
  monthNum: number;
  dayNum: number;
}

// 十二地支 (12 Branches)
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 十天干 (10 Stems)
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 十二宫名称 (12 Palace Names in fixed order)
const PALACE_NAMES = [
  '命宫',      // Life (Ming) - Index 0
  '兄弟',      // Siblings - Index 1
  '夫妻',      // Spouse - Index 2
  '子女',      // Children - Index 3
  '财帛',      // Wealth - Index 4
  '疾厄',      // Health - Index 5
  '迁移',      // Travel - Index 6
  '仆役',      // Friends (Servants) - Index 7
  '官禄',      // Career - Index 8
  '田宅',      // Property - Index 9
  '福德',      // Fortune - Index 10
  '父母',      // Parents - Index 11
];

// 十四主星 (14 Main Stars) - reference table for future use
const MAIN_STAR_NAMES = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
];
// Note: MAIN_STAR_NAMES defined for reference - actual calculations use placement algorithms below

// 五行局对应表 - reference for detailed element calculations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ELEMENT_TABLE: Record<string, Record<string, string>> = {
  '子': { '子': '水二局', '丑': '土五局', '寅': '金四局', '卯': '木三局', '辰': '火六局', '巳': '火六局' },
  '丑': { '子': '火六局', '丑': '土五局', '寅': '金四局', '卯': '木三局', '辰': '水二局', '巳': '土五局' },
  '寅': { '子': '木三局', '丑': '金四局', '寅': '土五局', '卯': '火六局', '辰': '水二局', '巳': '火六局' },
  '卯': { '子': '木三局', '丑': '金四局', '寅': '土五局', '卯': '火六局', '辰': '水二局', '巳': '火六局' },
  '辰': { '子': '火六局', '丑': '木三局', '寅': '金四局', '卯': '土五局', '辰': '水二局', '巳': '木三局' },
  '巳': { '子': '火六局', '丑': '木三局', '寅': '金四局', '卯': '土五局', '辰': '水二局', '巳': '木三局' },
  '午': { '子': '土五局', '丑': '水二局', '寅': '火六局', '卯': '金四局', '辰': '木三局', '巳': '金四局' },
  '未': { '子': '土五局', '丑': '水二局', '寅': '火六局', '卯': '金四局', '辰': '木三局', '巳': '金四局' },
  '申': { '子': '金四局', '丑': '火六局', '寅': '水二局', '卯': '土五局', '辰': '木三局', '巳': '水二局' },
  '酉': { '子': '金四局', '丑': '火六局', '寅': '水二局', '卯': '土五局', '辰': '木三局', '巳': '水二局' },
  '戌': { '子': '水二局', '丑': '土五局', '寅': '火六局', '卯': '金四局', '辰': '木三局', '巳': '土五局' },
  '亥': { '子': '水二局', '丑': '土五局', '寅': '火六局', '卯': '金四局', '辰': '木三局', '巳': '土五局' },
};
// Note: ELEMENT_TABLE defined for reference - currently using simplified element determination

// 时辰对应地支 (Hour to Branch mapping)
const HOUR_TO_BRANCH = [
  { start: 23, end: 1, branch: 0 },   // 子 (23:00-01:00)
  { start: 1, end: 3, branch: 1 },    // 丑 (01:00-03:00)
  { start: 3, end: 5, branch: 2 },    // 寅 (03:00-05:00)
  { start: 5, end: 7, branch: 3 },    // 卯 (05:00-07:00)
  { start: 7, end: 9, branch: 4 },    // 辰 (07:00-09:00)
  { start: 9, end: 11, branch: 5 },   // 巳 (09:00-11:00)
  { start: 11, end: 13, branch: 6 },  // 午 (11:00-13:00)
  { start: 13, end: 15, branch: 7 },  // 未 (13:00-15:00)
  { start: 15, end: 17, branch: 8 },  // 申 (15:00-17:00)
  { start: 17, end: 19, branch: 9 },  // 酉 (17:00-19:00)
  { start: 19, end: 21, branch: 10 }, // 戌 (19:00-21:00)
  { start: 21, end: 23, branch: 11 }, // 亥 (21:00-23:00)
];

// 农历月份天数表 - reference for future lunar calculations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LUNAR_MONTH_DAYS = [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30];
// Note: LUNAR_MONTH_DAYS defined for reference - accurate conversion needs astronomical data

// 年干阴阳 (Stem Yin/Yang)
const STEM_YIN_YANG: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

/**
 * Convert solar date to lunar date (simplified algorithm)
 * Note: Accurate conversion requires astronomical/ephemeris data
 */
export function solarToLunar(solarDate: Date): LunarDate {
  // This is a simplified conversion - in production use astronomical libraries
  // like 'lunar-javascript' or ephemeris data
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();
  
  // Simplified approximation (accurate conversions need astronomical calculations)
  const hour = solarDate.getHours();
  const hourBranch = getHourBranch(hour, solarDate.getMinutes());
  
  // Lunar conversion - simplified algorithm (production should use astronomical libraries)
  const lunarYear = year; // Simplified - should be calculated properly
  const lunarMonth = month; // Simplified
  const lunarDay = day; // Simplified
  
  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth: false,
    hourBranch: hourBranch
  };
}

/**
 * Get hour branch (时辰) from hour and minute
 * Handles the special case of 23:00-00:00 (belongs to next day)
 */
function getHourBranch(hour: number, minute: number): number {
  // Special case: 23:00-24:00 belongs to Zi (子) of next day
  if (hour === 23 && minute >= 0) {
    return 0; // 子
  }
  
  for (const mapping of HOUR_TO_BRANCH) {
    if (hour >= mapping.start && hour < mapping.end) {
      return mapping.branch;
    }
  }
  
  // Should not reach here, but default to Zi
  return 0;
}

/**
 * Get year stem and branch
 */
function getYearStemBranch(year: number): { stem: string; branch: string; stemIndex: number; branchIndex: number } {
  // 年干 = (year - 3) % 10
  // 年支 = (year - 3) % 12
  const stemIndex = (year - 4) % 10; // Adjusted for array index
  const branchIndex = (year - 4) % 12;
  
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    stemIndex,
    branchIndex
  };
}

/**
 * Calculate the life palace (命宫) position
 * Formula: Life Palace = (Month Branch + Hour Branch) % 12, then count backwards
 */
function calculateLifePalace(lunarMonth: number, hourBranch: number): number {
  // Month branch: 寅(2) is month 1, so month 1 -> 寅(2), month 12 -> 丑(1)
  const monthBranch = (lunarMonth + 1) % 12;
  
  // Life palace = (Month Branch Index + Hour Branch Index) % 12
  const lifePalaceIndex = (monthBranch + hourBranch) % 12;
  
  return lifePalaceIndex;
}

/**
 * Calculate the body palace (身宫) position
 * Formula: Body Palace = (Month Branch + Hour Branch) % 12, then count forward
 */
function calculateBodyPalace(lunarMonth: number, hourBranch: number): number {
  const monthBranch = (lunarMonth + 1) % 12;
  
  // Body palace is at (month + hour) position
  const bodyPalaceIndex = (monthBranch + hourBranch + 6) % 12;
  
  return bodyPalaceIndex;
}

/**
 * Get Five Element (五行) and Element Number (局数)
 */
function getFiveElement(lifePalaceBranch: string): { element: string; number: number } {
  // Simplified lookup - in real implementation, use detailed tables
  const elementMap: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };
  
  const element = elementMap[lifePalaceBranch] || '土';
  const number = 5; // Simplified - should be calculated based on complex rules
  
  return { element, number };
}

/**
 * Calculate 紫微 star position based on element number and lunar day
 */
function calculateZiWeiPosition(elementNumber: number, lunarDay: number): number {
  // 紫微位置 = (elementNumber - (lunarDay % elementNumber)) % 12
  let remainder = lunarDay % elementNumber;
  if (remainder === 0) remainder = elementNumber;
  
  let position = (elementNumber - remainder) / 2;
  position = Math.floor(position) + (lunarDay > elementNumber ? 6 : 0);
  position = position % 12;
  
  return position;
}

/**
 * Place the 14 main stars based on Zi Wei position
 */
function placeMainStars(ziWeiPos: number): Star[] {
  const stars: Star[] = [];
  
  // 紫微
  stars.push({ name: '紫微', type: 'main', brightness: 1, palaceIndex: ziWeiPos });
  
  // 天机 - Zi Wei + 1
  stars.push({ name: '天机', type: 'main', brightness: 1, palaceIndex: (ziWeiPos + 1) % 12 });
  
  // 太阳
  stars.push({ name: '太阳', type: 'main', brightness: 1, palaceIndex: (ziWeiPos + 3) % 12 });
  
  // 武曲
  stars.push({ name: '武曲', type: 'main', brightness: 1, palaceIndex: (ziWeiPos + 4) % 12 });
  
  // 天同
  stars.push({ name: '天同', type: 'main', brightness: 1, palaceIndex: (ziWeiPos + 7) % 12 });
  
  // 廉贞
  stars.push({ name: '廉贞', type: 'main', brightness: 1, palaceIndex: (ziWeiPos + 8) % 12 });
  
  // 天府 - Opposite Zi Wei
  const tianFuPos = (ziWeiPos + 6) % 12;
  stars.push({ name: '天府', type: 'main', brightness: 1, palaceIndex: tianFuPos });
  
  // 太阴
  stars.push({ name: '太阴', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 1) % 12 });
  
  // 贪狼
  stars.push({ name: '贪狼', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 2) % 12 });
  
  // 巨门
  stars.push({ name: '巨门', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 3) % 12 });
  
  // 天相
  stars.push({ name: '天相', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 4) % 12 });
  
  // 天梁
  stars.push({ name: '天梁', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 5) % 12 });
  
  // 七杀
  stars.push({ name: '七杀', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 6) % 12 });
  
  // 破军
  stars.push({ name: '破军', type: 'main', brightness: 1, palaceIndex: (tianFuPos + 10) % 12 });
  
  return stars;
}

/**
 * Place auxiliary stars (辅曜)
 */
function placeAuxiliaryStars(mainStars: Star[], yearStem: string, lunarMonth: number): Star[] {
  const stars: Star[] = [];
  
  // 左辅 - based on month
  const zuoFuPos = (lunarMonth + 2) % 12;
  stars.push({ name: '左辅', type: 'auxiliary', brightness: 2, palaceIndex: zuoFuPos });
  
  // 右弼 - based on month
  const youBiPos = (14 - lunarMonth) % 12;
  stars.push({ name: '右弼', type: 'auxiliary', brightness: 2, palaceIndex: youBiPos });
  
  // 文昌 - based on year stem
  const stemIndex = STEMS.indexOf(yearStem);
  const wenChangPos = (stemIndex + 4) % 12;
  stars.push({ name: '文昌', type: 'auxiliary', brightness: 2, palaceIndex: wenChangPos });
  
  // 文曲
  const wenQuPos = (10 - stemIndex) % 12;
  stars.push({ name: '文曲', type: 'auxiliary', brightness: 2, palaceIndex: wenQuPos });
  
  // 天魁, 天钺 - based on year stem
  const tianKuiPos = (stemIndex + 6) % 12;
  const tianYuePos = (stemIndex + 8) % 12;
  stars.push({ name: '天魁', type: 'auxiliary', brightness: 2, palaceIndex: tianKuiPos });
  stars.push({ name: '天钺', type: 'auxiliary', brightness: 2, palaceIndex: tianYuePos });
  
  return stars;
}

// Reference for main star names in calculations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _mainStarNamesRef = MAIN_STAR_NAMES;

/**
 * Place minor stars (杂曜)
 */
function placeMinorStars(yearStem: string, yearBranch: string): Star[] {
  const stars: Star[] = [];
  
  // 火星, 铃星 (based on year branch)
  const branchIndex = BRANCHES.indexOf(yearBranch);
  const huoXingPos = (branchIndex + 11) % 12;
  const lingXingPos = (branchIndex + 7) % 12;
  stars.push({ name: '火星', type: 'minor', brightness: 4, palaceIndex: huoXingPos });
  stars.push({ name: '铃星', type: 'minor', brightness: 4, palaceIndex: lingXingPos });
  
  // 地空, 地劫 (fixed positions)
  stars.push({ name: '地空', type: 'minor', brightness: 5, palaceIndex: 10 }); // Xu (戌)
  stars.push({ name: '地劫', type: 'minor', brightness: 5, palaceIndex: 11 }); // Hai (亥)
  
  // 禄存 (based on year stem)
  const stemIndex = STEMS.indexOf(yearStem);
  const luCunPos = (stemIndex + 9) % 12;
  stars.push({ name: '禄存', type: 'lucky', brightness: 3, palaceIndex: luCunPos });
  
  // 擎羊, 陀罗 (based on year stem, near 禄存)
  const qingYangPos = (luCunPos + 1) % 12;
  const tuoLuoPos = (luCunPos + 11) % 12;
  stars.push({ name: '擎羊', type: 'minor', brightness: 4, palaceIndex: qingYangPos });
  stars.push({ name: '陀罗', type: 'minor', brightness: 4, palaceIndex: tuoLuoPos });
  
  return stars;
}

/**
 * Create the 12 palaces with their branches and stars
 */
function createPalaces(lifePalaceIndex: number, allStars: Star[]): Palace[] {
  const palaces: Palace[] = [];
  
  // Start from Zi (子) at position determined by life palace
  // Life palace determines the starting branch position
  // The life palace itself corresponds to a specific branch
  
  for (let i = 0; i < 12; i++) {
    // Calculate the branch for this palace position
    // The life palace has a specific branch, then we go clockwise
    const branchIndex = (lifePalaceIndex + i) % 12;
    
    const palaceStars = allStars.filter(star => star.palaceIndex === i);
    const mainStars = palaceStars.filter(s => s.type === 'main');
    const auxiliaryStars = palaceStars.filter(s => s.type === 'auxiliary');
    const minorStars = palaceStars.filter(s => s.type === 'minor' || s.type === 'lucky' || s.type === 'unlucky');
    
    palaces.push({
      index: i,
      name: PALACE_NAMES[i],
      branch: BRANCHES[branchIndex],
      mainStars,
      auxiliaryStars,
      minorStars
    });
  }
  
  return palaces;
}

/**
 * Main calculation function
 */
export function calculateChart(birthData: BirthData): ChartData {
  // Parse birth date
  const solarDate = new Date(birthData.birthDate + 'T' + birthData.birthTime);
  
  // Convert to lunar
  const lunarDate = solarToLunar(solarDate);
  
  // Get year stem and branch
  const yearInfo = getYearStemBranch(lunarDate.year);
  
  // Calculate life palace (命宫)
  const lifePalace = calculateLifePalace(lunarDate.month, lunarDate.hourBranch);
  
  // Calculate body palace (身宫)
  const bodyPalace = calculateBodyPalace(lunarDate.month, lunarDate.hourBranch);
  
  // Get Five Element
  const lifePalaceBranch = BRANCHES[lifePalace];
  const { element, number: elementNumber } = getFiveElement(lifePalaceBranch);
  
  // Calculate Zi Wei position
  const ziWeiPos = calculateZiWeiPosition(elementNumber, lunarDate.day);
  
  // Place main stars
  const mainStars = placeMainStars(ziWeiPos);
  
  // Place auxiliary stars
  const auxiliaryStars = placeAuxiliaryStars(mainStars, yearInfo.stem, lunarDate.month);
  
  // Place minor stars
  const minorStars = placeMinorStars(yearInfo.stem, yearInfo.branch);
  
  // Combine all stars
  const allStars = [...mainStars, ...auxiliaryStars, ...minorStars];
  
  // Create palaces
  const palaces = createPalaces(lifePalace, allStars);
  
  // Mark life and body palaces
  palaces[lifePalace].isLifePalace = true;
  palaces[bodyPalace].isBodyPalace = true;
  
  // Determine yin/yang
  const yinYang = STEM_YIN_YANG[yearInfo.stem] || '阳';
  
  return {
    birthData,
    lunarDate,
    lifePalace,
    bodyPalace,
    fiveElement: element,
    elementNumber,
    yinYang,
    palaces,
    mainStars,
    allStars,
    mingIndex: lifePalace,
    shenIndex: bodyPalace,
    yearStem: yearInfo.stem,
    yearBranch: yearInfo.branch,
    monthNum: lunarDate.month,
    dayNum: lunarDate.day
  };
}

/**
 * Get palace interpretation
 */
export function getPalaceInterpretation(palaceName: string): string {
  const interpretations: Record<string, string> = {
    '命宫': '命宮為本命所在，顯示個人的性格、才能、命運走向。主星在此最為重要，決定一生大運。',
    '兄弟': '兄弟宮主兄弟姐妹關係、數量多寡，亦主交友狀況與合夥運勢。',
    '夫妻': '夫妻宮主婚姻狀況、配偶特質、感情生活與婚姻穩定性。',
    '子女': '子女宮主子嗣緣分、子女數量、與子女關係，亦主桃花與合夥事業。',
    '财帛': '財帛宮主財運、理財能力、收入來源與物質生活狀況。',
    '疾厄': '疾厄宮主身體健康、疾病傾向、體質強弱與意外災厄。',
    '迁移': '遷移宮主外出運、遷移變動、社交應對與外在環境適應能力。',
    '仆役': '僕役宮主人際關係、下屬緣分、朋友助力與被服務狀況。',
    '官禄': '官祿宮主事業發展、工作性質、社會地位與成就高低。',
    '田宅': '田宅宮主不動產、家宅運、居住環境與家庭根基。',
    '福德': '福德宮主精神世界、享福能力、興趣嗜好與內心滿足感。',
    '父母': '父母宮主父母緣分、長輩關係、學業考運與上司緣分。'
  };
  
  return interpretations[palaceName] || '';
}

/**
 * Get star interpretation
 */
export function getStarInterpretation(starName: string): string {
  const interpretations: Record<string, string> = {
    '紫微': '帝星，主尊貴、權威、領導能力，有帝王之氣。',
    '天机': '智星，主聰明、機智、變動，善謀略而多變化。',
    '太阳': '貴星，主光明磊落、熱心公益，男性之星。',
    '武曲': '財星，主財富、行動力、果決，有開創能力。',
    '天同': '福星，主溫和、善良、享受，有福氣少爭執。',
    '廉贞': '次桃花，主果決、威權、風流，善交際應酬。',
    '天府': '庫星，主保守、穩重、收藏，有管理能力。',
    '太阴': '富星，主溫柔、內斂、財富，女性之星。',
    '贪狼': '桃花星，主慾望、才藝、交際，多學少精。',
    '巨门': '暗星，主是非、口才、研究，宜動口職業。',
    '天相': '印綬，主誠實、協調、服務，有輔佐之才。',
    '天梁': '壽星，主正直、清高、解厄，有化解災難之力。',
    '七杀': '將星，主剛毅、冒險、變動，有開創力亦多波折。',
    '破军': '耗星，主變動、開創、耗散，先破後立之象。'
  };
  
  return interpretations[starName] || '';
}

export function formatLunarDate(lunarDate: LunarDate): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return `${lunarDate.year}年 ${lunarDate.isLeapMonth ? '閏' : ''}${lunarDate.month}月 ${lunarDate.day}日 ${branches[lunarDate.hourBranch]}時`;
}

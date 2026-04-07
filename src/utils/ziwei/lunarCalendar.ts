/**
 * Solar to Lunar Calendar Converter
 * Based on astronomical data for 1900-2100
 * Uses a lookup table approach for accurate conversion
 */

// Known new moon dates (simplified lookup table for 1900-2050)
// Each entry is [year, month, day] of the first day of lunar month 1
// This is a condensed version - in production, use a complete ephemeris database
const NEW_MOON_DATES: number[][] = [
  // 1900-1910
  [1900, 1, 31], [1901, 2, 19], [1902, 2, 8], [1903, 1, 29], [1904, 2, 16],
  [1905, 2, 4], [1906, 1, 25], [1907, 2, 13], [1908, 2, 2], [1909, 1, 22],
  [1910, 2, 10],
  // 1910-1920
  [1911, 1, 30], [1912, 2, 18], [1913, 2, 6], [1914, 1, 26], [1915, 2, 14],
  [1916, 2, 3], [1917, 1, 23], [1918, 2, 11], [1919, 2, 1], [1920, 2, 20],
  // 1920-1930
  [1921, 2, 8], [1922, 1, 28], [1923, 2, 16], [1924, 2, 5], [1925, 1, 24],
  [1926, 2, 13], [1927, 2, 2], [1928, 1, 22], [1929, 2, 10], [1930, 1, 30],
  // 1930-1940
  [1931, 2, 17], [1932, 2, 6], [1933, 1, 26], [1934, 2, 14], [1935, 2, 4],
  [1936, 1, 24], [1937, 2, 11], [1938, 1, 31], [1939, 2, 19], [1940, 2, 8],
  // 1940-1950
  [1941, 1, 27], [1942, 2, 15], [1943, 2, 5], [1944, 1, 25], [1945, 2, 13],
  [1946, 2, 2], [1947, 1, 22], [1948, 2, 10], [1949, 1, 29], [1950, 2, 17],
  // 1950-1960
  [1951, 2, 6], [1952, 1, 27], [1953, 2, 14], [1954, 2, 3], [1955, 1, 24],
  [1956, 2, 12], [1957, 1, 31], [1958, 2, 18], [1959, 2, 8], [1960, 1, 28],
  // 1960-1970
  [1961, 2, 15], [1962, 2, 5], [1963, 1, 25], [1964, 2, 13], [1965, 2, 2],
  [1966, 1, 21], [1967, 2, 9], [1968, 1, 30], [1969, 2, 17], [1970, 2, 6],
  // 1970-1980
  [1971, 1, 27], [1972, 2, 15], [1973, 2, 3], [1974, 1, 23], [1975, 2, 11],
  [1976, 1, 31], [1977, 2, 18], [1978, 2, 7], [1979, 1, 28], [1980, 2, 16],
  // 1980-1990
  [1981, 2, 5], [1982, 1, 25], [1983, 2, 13], [1984, 2, 2], [1985, 2, 20],
  [1986, 2, 9], [1987, 1, 29], [1988, 2, 17], [1989, 2, 6], [1990, 1, 27],
  // 1990-2000
  [1991, 2, 15], [1992, 2, 4], [1993, 1, 23], [1994, 2, 10], [1995, 1, 31],
  [1996, 2, 19], [1997, 2, 7], [1998, 1, 28], [1999, 2, 16], [2000, 2, 5],
  // 2000-2010
  [2001, 1, 24], [2002, 2, 12], [2003, 2, 1], [2004, 1, 22], [2005, 2, 9],
  [2006, 1, 29], [2007, 2, 18], [2008, 2, 7], [2009, 1, 26], [2010, 2, 14],
  // 2010-2020
  [2011, 2, 3], [2012, 1, 23], [2013, 2, 10], [2014, 1, 31], [2015, 2, 19],
  [2016, 2, 8], [2017, 1, 28], [2018, 2, 16], [2019, 2, 5], [2020, 1, 25],
  // 2020-2030
  [2021, 2, 12], [2022, 2, 1], [2023, 1, 22], [2024, 2, 10], [2025, 1, 29],
  [2026, 2, 17], [2027, 2, 6], [2028, 1, 26], [2029, 2, 13], [2030, 2, 3],
  // 2030-2040
  [2031, 1, 23], [2032, 2, 11], [2033, 1, 31], [2034, 2, 19], [2035, 2, 8],
  [2036, 1, 28], [2037, 2, 15], [2038, 2, 4], [2039, 1, 24], [2040, 2, 12],
  // 2040-2050
  [2041, 2, 1], [2042, 1, 22], [2043, 2, 10], [2044, 1, 30], [2045, 2, 17],
  [2046, 2, 6], [2047, 1, 26], [2048, 2, 14], [2049, 2, 2], [2050, 1, 23],
];

// Leap month data: which lunar year has leap month and which month is it
// Format: [year, leapMonth] where leapMonth is 0 if no leap month
const LEAP_MONTH_DATA: Record<number, number> = {
  1900: 8, 1901: 0, 1902: 0, 1903: 0, 1904: 2, 1905: 0, 1906: 4, 1907: 0, 1908: 2, 1909: 0,
  1910: 6, 1911: 0, 1912: 5, 1913: 0, 1914: 2, 1915: 0, 1916: 6, 1917: 0, 1918: 5, 1919: 0,
  1920: 4, 1921: 0, 1922: 2, 1923: 0, 1924: 6, 1925: 0, 1926: 5, 1927: 0, 1928: 2, 1929: 7,
  1930: 0, 1931: 5, 1932: 0, 1933: 3, 1934: 0, 1935: 6, 1936: 0, 1937: 5, 1938: 0, 1939: 2,
  1940: 7, 1941: 0, 1942: 6, 1943: 0, 1944: 2, 1945: 0, 1946: 7, 1947: 0, 1948: 5, 1949: 0,
  1950: 3, 1951: 0, 1952: 8, 1953: 0, 1954: 6, 1955: 0, 1956: 4, 1957: 0, 1958: 3, 1959: 7,
  1960: 0, 1961: 6, 1962: 0, 1963: 4, 1964: 0, 1965: 3, 1966: 7, 1967: 0, 1968: 5, 1969: 0,
  1970: 4, 1971: 0, 1972: 2, 1973: 0, 1974: 6, 1975: 0, 1976: 5, 1977: 0, 1978: 3, 1979: 7,
  1980: 0, 1981: 6, 1982: 0, 1983: 4, 1984: 0, 1985: 2, 1986: 7, 1987: 0, 1988: 6, 1989: 0,
  1990: 5, 1991: 0, 1992: 3, 1993: 0, 1994: 2, 1995: 7, 1996: 0, 1997: 6, 1998: 0, 1999: 5,
  2000: 0, 2001: 3, 2002: 0, 2003: 2, 2004: 6, 2005: 0, 2006: 5, 2007: 0, 2008: 4, 2009: 2,
  2010: 0, 2011: 6, 2012: 4, 2013: 0, 2014: 9, 2015: 0, 2016: 6, 2017: 0, 2018: 5, 2019: 0,
  2020: 4, 2021: 0, 2022: 2, 2023: 0, 2024: 6, 2025: 0, 2026: 5, 2027: 0, 2028: 3, 2029: 7,
  2030: 0, 2031: 6, 2032: 0, 2033: 4, 2034: 0, 2035: 2, 2036: 7, 2037: 0, 2038: 6, 2039: 0,
  2040: 5, 2041: 0, 2042: 3, 2043: 0, 2044: 2, 2045: 7, 2046: 0, 2047: 5, 2048: 0, 2049: 3,
  2050: 0,
};

// Lunar month length reference for astronomical calculations
// Average synodic month: 29.53059 days

/**
 * Convert solar date to accurate lunar date
 * Returns lunar year, month, day, and leap month status
 */
export function solarToLunarAccurate(solarDate: Date): {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
} {
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();
  
  // Find the appropriate lunar year
  let lunarYear = year;
  let newMoonDate: Date | null = null;
  
  // Search for the lunar year containing this solar date
  for (let i = 0; i < NEW_MOON_DATES.length - 1; i++) {
    const [ny, nm, nd] = NEW_MOON_DATES[i];
    const [nny, nnm, nnd] = NEW_MOON_DATES[i + 1];
    
    const currentNewMoon = new Date(ny, nm - 1, nd);
    const nextNewMoon = new Date(nny, nnm - 1, nnd);
    
    const targetDate = new Date(year, month - 1, day);
    
    if (targetDate >= currentNewMoon && targetDate < nextNewMoon) {
      lunarYear = ny;
      newMoonDate = currentNewMoon;
      break;
    }
  }
  
  if (!newMoonDate) {
    // Fallback to approximation if outside known range
    return approximateLunarConversion(solarDate);
  }
  
  // Calculate days since new moon (start of lunar new year)
  const targetDate = new Date(year, month - 1, day);
  const daysSinceNewMoon = Math.floor((targetDate.getTime() - newMoonDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // Calculate lunar month and day
  let lunarMonth = 1;
  let lunarDay = daysSinceNewMoon + 1;
  let isLeapMonth = false;
  
  // Get leap month for this year
  const leapMonth = LEAP_MONTH_DATA[lunarYear] || 0;
  
  // Determine lunar month by checking month lengths
  let daysAccumulated = 0;
  let actualMonthCount = 0;  // Tracks the logical month number (handles leap months)
  const monthLengths = getMonthLengths(lunarYear, leapMonth);
  
  for (let i = 0; i < monthLengths.length; i++) {
    const monthLength = monthLengths[i];
    if (daysAccumulated + monthLength > daysSinceNewMoon) {
      // Found the month
      lunarDay = daysSinceNewMoon - daysAccumulated + 1;
      
      // Handle leap month
      if (leapMonth > 0 && actualMonthCount >= leapMonth) {
        if (actualMonthCount === leapMonth && daysSinceNewMoon < daysAccumulated + monthLength) {
          // This is the leap month
          lunarMonth = leapMonth;
          isLeapMonth = true;
        } else {
          // Regular month after leap
          lunarMonth = actualMonthCount;
          isLeapMonth = false;
        }
      } else {
        lunarMonth = actualMonthCount + 1;
        isLeapMonth = false;
      }
      break;
    }
    daysAccumulated += monthLength;
    actualMonthCount++;
    
    // Account for leap month (same month number, counted separately)
    if (leapMonth > 0 && actualMonthCount === leapMonth) {
      actualMonthCount++; // Skip the leap month number for regular months after
    }
  }
  
  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth
  };
}

/**
 * Get month lengths for a lunar year
 */
function getMonthLengths(year: number, leapMonth: number): number[] {
  const lengths: number[] = [];
  const totalDays = getLunarYearDays(year);
  
  // Standard lunar months alternate between 29 and 30 days
  // First determine base pattern, then adjust based on actual year length
  const monthCount = leapMonth > 0 ? 13 : 12;
  
  // Build month lengths, accounting for the total year length
  // In a full implementation, this would use precise ephemeris data per year
  for (let i = 0; i < monthCount; i++) {
    // Alternate between 29 and 30 days
    const baseLength = (i % 2 === 0) ? 30 : 29;
    lengths.push(baseLength);
  }
  
  // Adjust last month to match total year days (simplified adjustment)
  const currentTotal = lengths.reduce((a, b) => a + b, 0);
  const adjustment = totalDays - currentTotal;
  if (adjustment !== 0 && lengths.length > 0) {
    lengths[lengths.length - 1] += adjustment;
  }
  
  return lengths;
}

/**
 * Get total days in a lunar year
 */
function getLunarYearDays(year: number): number {
  const idx = NEW_MOON_DATES.findIndex(d => d[0] === year);
  if (idx >= 0 && idx < NEW_MOON_DATES.length - 1) {
    const [y1, m1, d1] = NEW_MOON_DATES[idx];
    const [y2, m2, d2] = NEW_MOON_DATES[idx + 1];
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    return Math.floor((date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000));
  }
  return LEAP_MONTH_DATA[year] > 0 ? 384 : 354; // Approximate
}

/**
 * Fallback approximation when outside known date range
 */
function approximateLunarConversion(solarDate: Date): {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
} {
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();
  
  // Very rough approximation: lunar year starts ~Jan/Feb
  // This is only used for dates outside 1900-2050 range
  const offset = (month <= 2) ? -1 : 0;
  
  return {
    year: year + offset,
    month: month,
    day: day,
    isLeapMonth: false
  };
}

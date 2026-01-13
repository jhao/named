import { Solar } from 'lunar-javascript';
import { ElementScore } from '../types';

/**
 * Calculate BaZi (Four Pillars) based on Gregorian Date
 * Uses strict Solar Terms (JieQi) logic for Month Pillar
 */
export const calculateBaZi = (dateStr: string, timeStr: string): string[] => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  // Initialize Solar date
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  
  // Convert to Lunar (which holds the BaZi logic in the library)
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  // Update: Set sect for calculation preference if needed, but default is standard
  // lunar.getEightChar() returns the BaZi object
  
  return [
    eightChar.getYear(),  // Year GanZhi
    eightChar.getMonth(), // Month GanZhi
    eightChar.getDay(),   // Day GanZhi
    eightChar.getTime()   // Hour GanZhi
  ];
};

const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

/**
 * Basic Wuxing Analysis (Counting method)
 * Used primarily for the Local/System mode
 */
export const calculateWuxingBasic = (bazi: string[]) => {
   const allChars = bazi.join('').split(''); // e.g. ["甲", "子", "乙", "丑", ...]
   const counts: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
   
   allChars.forEach(c => {
     const wx = WUXING_MAP[c];
     if (wx) counts[wx]++;
   });
   
   const total = 8;
   const distribution: ElementScore[] = Object.keys(counts).map(el => ({
     element: el,
     score: Math.round((counts[el] / total) * 100)
   }));
   
   // Elements with 0 count are missing
   const missing = Object.keys(counts).filter(el => counts[el] === 0);
   
   // Identify "XiYong" (Simulated for local mode: usually missing elements or weak elements)
   // In real professional analysis this is complex, but for local alg we target missing first.
   
   return { distribution, missing };
};

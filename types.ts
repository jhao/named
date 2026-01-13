export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export enum AppMode {
  GENERATE = 'GENERATE',
  ANALYZE = 'ANALYZE',
  HISTORY = 'HISTORY'
}

export enum ServiceMode {
  LLM = 'LLM', // Large Model Version
  SYSTEM = 'SYSTEM' // System Logic Version
}

export enum LLMProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek'
}

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string; // Optional override
  modelName?: string; // Optional override
}

export interface AppSettings {
  serviceMode: ServiceMode;
  llmConfig: LLMConfig;
}

export interface UserInput {
  surname: string;
  name?: string; // Only for analysis
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
}

export interface ElementScore {
  element: string; // 金, 木, 水, 火, 土
  score: number; // 0-100 representation of strength in BaZi
}

export interface GeneratedName {
  characters: string;
  pinyin: string;
  wuxing: string; // e.g., "木火"
  score: number;
  poem: string; // A concise poetic source or phrase
  meaning: string; // Detailed explanation
  luckyAnalysis: string; // Why it fits the BaZi
}

export interface GenerationResponse {
  bazi: string[]; // The 4 pillars (8 chars)
  missingElements: string[];
  elementDistribution: ElementScore[];
  suggestions: GeneratedName[];
}

export interface AnalysisResponse {
  bazi: string[];
  nameCharacters: string;
  score: number;
  baziAnalysis: string; // Analysis of the birth chart
  nameMeaning: string;
  wuxingBalance: string; // How the name balances the chart
  elementDistribution: ElementScore[];
  conclusion: string; // Final verdict
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: AppMode; // GENERATE or ANALYZE
  input: UserInput;
  data: GenerationResponse | AnalysisResponse;
}

// UI State interfaces
export interface LoadingState {
  isLoading: boolean;
  message: string;
}

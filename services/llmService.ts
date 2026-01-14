import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, GenerationResponse, AnalysisResponse, LLMConfig, LLMProvider, NameLength } from "../types";
import { calculateBaZi } from "./baziCalculator";

/**
 * Helper to get the API Key or Fallback
 */
const getApiKey = (config: LLMConfig): string => {
  if (config.apiKey && config.apiKey.trim() !== '') {
    return config.apiKey;
  }
  // Fallback to process.env for Gemini if not provided
  if (config.provider === LLMProvider.GEMINI && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  throw new Error(`请配置 ${config.provider} 的 API Key`);
};

/**
 * Build Prompts
 */
const getSystemPrompt = () => "你是一位精通中国传统文化、周易八字、五行生克和古典文学的起名大师。你的名字风格高雅、意境优美。请严格按照JSON格式输出。";

const getGenerationPrompt = (input: UserInput, bazi: string[], excludeNames: string[] = []) => {
  let lengthInstruction = "";
  if (input.nameLength === NameLength.SINGLE) {
    lengthInstruction = "6. 请严格只生成单字名（名字只有1个字）。";
  } else if (input.nameLength === NameLength.DOUBLE) {
    lengthInstruction = "6. 请严格只生成双字名（名字有2个字）。";
  } else {
    lengthInstruction = "6. 名字可以是单字或双字，请根据音律和字义自由搭配。";
  }

  return `
    请为这位${input.gender}孩起名。
    姓氏：${input.surname}
    出生日期：${input.birthDate}
    出生时间：${input.birthTime}
    
    参考八字（请基于此八字进行分析，不要重新推算，直接使用）：${bazi.join(' ')}
    
    任务要求：
    1. 根据给定的生辰八字分析五行强弱，找出喜用神和缺失元素。
    2. 生成 5 个好听、有文化内涵、且能平衡五行的名字。
    3. 名字要出自经典诗词或典故。
    ${excludeNames.length > 0 ? `4. 请完全避开以下名字，生成全新的：${excludeNames.join('、')}。` : ''}
    5. 返回的 suggestions 中的 characters 字段 **绝对不要包含姓氏**，只返回名字本身（例如姓李，起名李明，characters 字段只能是 "明"）。
    ${lengthInstruction}
    7. 返回严格的 JSON 格式，结构如下：
    {
      "bazi": ["String"],
      "missingElements": ["String"],
      "elementDistribution": [{"element": "String", "score": Number}],
      "suggestions": [{
        "characters": "String", // 仅名字，不含姓氏
        "pinyin": "String",
        "wuxing": "String",
        "score": Number,
        "poem": "String",
        "meaning": "String",
        "luckyAnalysis": "String"
      }]
    }
`;
};

const getAnalysisPrompt = (input: UserInput, bazi: string[]) => `
    请分析以下名字的吉凶。
    姓名：${input.surname}${input.name}
    性别：${input.gender}
    出生日期：${input.birthDate}
    出生时间：${input.birthTime}
    
    参考八字（请基于此八字进行分析，不要重新推算，直接使用）：${bazi.join(' ')}
    
    任务要求：
    1. 根据给定的八字定五行。
    2. 分析名字的字形、字义、五行属性是否补救了八字的不足。
    3. 给出评分和详细结论。
    4. 返回严格的 JSON 格式，结构如下：
    {
      "bazi": ["String"],
      "nameCharacters": "String",
      "score": Number,
      "baziAnalysis": "String",
      "nameMeaning": "String",
      "wuxingBalance": "String",
      "elementDistribution": [{"element": "String", "score": Number}],
      "conclusion": "String"
    }
`;

/**
 * Call Gemini API
 */
const callGemini = async (config: LLMConfig, prompt: string, isGeneration: boolean): Promise<any> => {
  const apiKey = getApiKey(config);
  const ai = new GoogleGenAI({ apiKey });
  const modelName = config.modelName || 'gemini-3-flash-preview';

  const schema = {
    type: Type.OBJECT,
    properties: isGeneration ? {
      bazi: { type: Type.ARRAY, items: { type: Type.STRING } },
      missingElements: { type: Type.ARRAY, items: { type: Type.STRING } },
      elementDistribution: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { element: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
      suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { characters: { type: Type.STRING }, pinyin: { type: Type.STRING }, wuxing: { type: Type.STRING }, score: { type: Type.NUMBER }, poem: { type: Type.STRING }, meaning: { type: Type.STRING }, luckyAnalysis: { type: Type.STRING } } } }
    } : {
      bazi: { type: Type.ARRAY, items: { type: Type.STRING } },
      nameCharacters: { type: Type.STRING },
      score: { type: Type.NUMBER },
      baziAnalysis: { type: Type.STRING },
      nameMeaning: { type: Type.STRING },
      wuxingBalance: { type: Type.STRING },
      elementDistribution: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { element: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
      conclusion: { type: Type.STRING }
    },
    required: isGeneration ? ["bazi", "suggestions", "elementDistribution"] : ["bazi", "score", "conclusion", "elementDistribution"]
  };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: getSystemPrompt(),
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("Gemini returned empty response");
  return JSON.parse(response.text);
};

/**
 * Call OpenAI Compatible API (OpenAI, DeepSeek)
 */
const callOpenAICompatible = async (config: LLMConfig, prompt: string): Promise<any> => {
  const apiKey = getApiKey(config);
  
  let baseUrl = config.baseUrl;
  let defaultModel = '';

  if (config.provider === LLMProvider.OPENAI) {
    baseUrl = baseUrl || "https://api.openai.com/v1";
    defaultModel = "gpt-4o-mini";
  } else if (config.provider === LLMProvider.DEEPSEEK) {
    baseUrl = baseUrl || "https://api.deepseek.com";
    defaultModel = "deepseek-chat";
  }

  const model = config.modelName || defaultModel;
  
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: getSystemPrompt() + " 返回纯JSON。" },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${config.provider} API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("API returned empty content");
  
  return JSON.parse(content);
};

/**
 * Main Generation Function
 */
export const generateNamesLLM = async (input: UserInput, config: LLMConfig, excludeNames: string[] = []): Promise<GenerationResponse> => {
  // Pre-calculate BaZi to ensure consistency
  const bazi = calculateBaZi(input.birthDate, input.birthTime);
  const prompt = getGenerationPrompt(input, bazi, excludeNames);
  
  let result;
  if (config.provider === LLMProvider.GEMINI) {
    result = await callGemini(config, prompt, true);
  } else {
    result = await callOpenAICompatible(config, prompt);
  }
  
  // Overwrite BaZi with calculated version to enforce consistency across modes
  if (result) {
    result.bazi = bazi;
  }
  return result;
};

/**
 * Main Analysis Function
 */
export const analyzeNameLLM = async (input: UserInput, config: LLMConfig): Promise<AnalysisResponse> => {
  // Pre-calculate BaZi to ensure consistency
  const bazi = calculateBaZi(input.birthDate, input.birthTime);
  const prompt = getAnalysisPrompt(input, bazi);
  
  let result;
  if (config.provider === LLMProvider.GEMINI) {
    result = await callGemini(config, prompt, false);
  } else {
    result = await callOpenAICompatible(config, prompt);
  }

  // Overwrite BaZi with calculated version to enforce consistency across modes
  if (result) {
    result.bazi = bazi;
  }
  return result;
};
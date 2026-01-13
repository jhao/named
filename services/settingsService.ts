import { AppSettings, ServiceMode, LLMProvider } from '../types';

const SETTINGS_KEY = 'lingyun_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  serviceMode: ServiceMode.SYSTEM,
  llmConfig: {
    provider: LLMProvider.GEMINI,
    apiKey: '', // Empty by default, will fallback to env if available in code
    baseUrl: '',
    modelName: ''
  }
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(data);
    // Merge with defaults to ensure new fields are present
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      llmConfig: {
        ...DEFAULT_SETTINGS.llmConfig,
        ...(parsed.llmConfig || {})
      }
    };
  } catch (e) {
    console.error("Failed to load settings", e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
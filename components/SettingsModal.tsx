import React, { useState, useEffect } from 'react';
import { AppSettings, ServiceMode, LLMProvider, LLMConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleModeChange = (mode: ServiceMode) => {
    setLocalSettings(prev => ({ ...prev, serviceMode: mode }));
  };

  const handleConfigChange = (key: keyof LLMConfig, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      llmConfig: { ...prev.llmConfig, [key]: value }
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900 bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-stone-800 to-stone-700 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-serif font-bold">系统设置</h2>
          <button onClick={onClose} className="text-stone-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Mode Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">计算引擎</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleModeChange(ServiceMode.LLM)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${localSettings.serviceMode === ServiceMode.LLM ? 'border-cinnabar bg-red-50 text-cinnabar' : 'border-stone-200 hover:border-stone-300 text-stone-500'}`}
              >
                <span className="font-bold text-lg mb-1">AI 大模型</span>
                <span className="text-xs opacity-70">智能、创意、多样</span>
              </button>
              <button
                onClick={() => handleModeChange(ServiceMode.SYSTEM)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${localSettings.serviceMode === ServiceMode.SYSTEM ? 'border-cinnabar bg-red-50 text-cinnabar' : 'border-stone-200 hover:border-stone-300 text-stone-500'}`}
              >
                <span className="font-bold text-lg mb-1">系统算法</span>
                <span className="text-xs opacity-70">稳定、经典、离线</span>
              </button>
            </div>
          </div>

          {/* LLM Configuration */}
          {localSettings.serviceMode === ServiceMode.LLM && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2 border-t pt-4 border-stone-100">大模型配置</h3>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">模型厂商</label>
                <select
                  value={localSettings.llmConfig.provider}
                  onChange={(e) => handleConfigChange('provider', e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar outline-none bg-white"
                >
                  <option value={LLMProvider.GEMINI}>Google Gemini</option>
                  <option value={LLMProvider.OPENAI}>OpenAI (GPT)</option>
                  <option value={LLMProvider.DEEPSEEK}>DeepSeek</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  API Key <span className="text-xs text-stone-400 font-normal">(必填)</span>
                </label>
                <input
                  type="password"
                  value={localSettings.llmConfig.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder={localSettings.llmConfig.provider === LLMProvider.GEMINI ? "使用默认或输入新 Key" : "sk-..."}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar outline-none"
                />
                <p className="text-xs text-stone-400 mt-1">Key 仅保存在本地浏览器中，不会上传至服务器。</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  API URL <span className="text-xs text-stone-400 font-normal">(选填，默认官方地址)</span>
                </label>
                <input
                  type="text"
                  value={localSettings.llmConfig.baseUrl || ''}
                  onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  模型名称 <span className="text-xs text-stone-400 font-normal">(选填)</span>
                </label>
                <input
                  type="text"
                  value={localSettings.llmConfig.modelName || ''}
                  onChange={(e) => handleConfigChange('modelName', e.target.value)}
                  placeholder={localSettings.llmConfig.provider === LLMProvider.GEMINI ? "gemini-3-flash-preview" : "gpt-4o"}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar outline-none"
                />
              </div>
            </div>
          )}

          {localSettings.serviceMode === ServiceMode.SYSTEM && (
             <div className="p-4 bg-stone-50 rounded-lg text-sm text-stone-600 border border-stone-200">
               <p>系统算法模式使用内置的经典起名逻辑，不依赖网络 API。适合无网络环境或追求稳定结果的场景。</p>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-cinnabar hover:bg-[#a33b43] text-white rounded-lg font-bold shadow-md transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

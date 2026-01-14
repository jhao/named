import React, { useState, useEffect } from 'react';
import { 
  Gender, 
  AppMode, 
  UserInput, 
  GenerationResponse, 
  AnalysisResponse, 
  LoadingState,
  HistoryItem,
  AppSettings,
  ServiceMode,
  GeneratedName,
  NameLength
} from './types';
import { generateNamesLLM, analyzeNameLLM } from './services/llmService';
import { generateNamesLocal, analyzeNameLocal } from './services/localService';
import { getHistory, saveHistoryItem, deleteHistoryItem } from './services/historyService';
import { getSettings, saveSettings } from './services/settingsService';
import ElementRadar from './components/ElementRadar';
import LoadingOverlay from './components/LoadingOverlay';
import SettingsModal from './components/SettingsModal';

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A47.654 47.654 0 0112 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, message: '' });
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Input State
  const [formData, setFormData] = useState<UserInput>({
    surname: '',
    name: '',
    gender: Gender.MALE,
    birthDate: '',
    birthTime: '12:00',
    nameLength: NameLength.DOUBLE
  });

  // Result State
  const [genResult, setGenResult] = useState<GenerationResponse | null>(null);
  const [anaResult, setAnaResult] = useState<AnalysisResponse | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNameLengthChange = (length: NameLength) => {
    setFormData(prev => ({ ...prev, nameLength: length }));
  };

  const handleHistoryRestore = (item: HistoryItem) => {
    setFormData(item.input);
    if (item.mode === AppMode.GENERATE) {
      setGenResult(item.data as GenerationResponse);
      setAnaResult(null);
      setMode(AppMode.GENERATE);
    } else {
      setAnaResult(item.data as AnalysisResponse);
      setGenResult(null);
      setMode(AppMode.ANALYZE);
    }
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.surname || !formData.birthDate || !formData.birthTime) {
      alert("请填写完整的出生信息");
      return;
    }
    if (mode === AppMode.ANALYZE && !formData.name) {
      alert("测名模式下请输入名字");
      return;
    }

    setLoading({ 
      isLoading: true, 
      message: settings.serviceMode === ServiceMode.LLM 
        ? (mode === AppMode.GENERATE ? 'AI大师正在排盘思考...' : 'AI大师正在推演吉凶...') 
        : '系统正在演算...' 
    });
    
    try {
      const isLLM = settings.serviceMode === ServiceMode.LLM;
      
      if (mode === AppMode.GENERATE) {
        const res = isLLM 
          ? await generateNamesLLM(formData, settings.llmConfig) 
          : await generateNamesLocal(formData);
          
        setGenResult(res);
        setAnaResult(null);
        
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mode: AppMode.GENERATE,
          input: { ...formData },
          data: res
        };
        const updatedHistory = saveHistoryItem(newItem);
        setHistory(updatedHistory);

      } else {
        const res = isLLM
          ? await analyzeNameLLM(formData, settings.llmConfig)
          : await analyzeNameLocal(formData);

        setAnaResult(res);
        setGenResult(null);

        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mode: AppMode.ANALYZE,
          input: { ...formData },
          data: res
        };
        const updatedHistory = saveHistoryItem(newItem);
        setHistory(updatedHistory);
      }
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : "未知错误";
      alert(`请求失败: ${errMsg} \n请检查网络或设置中的 API 配置。`);
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  const handleLoadMore = async () => {
    if (!genResult || mode !== AppMode.GENERATE) return;
    
    setLoading({ isLoading: true, message: '正在推衍更多良名...' });
    
    try {
      const isLLM = settings.serviceMode === ServiceMode.LLM;
      const currentNames = genResult.suggestions.map(s => s.characters);
      
      let newSuggestions: GeneratedName[] = [];
      
      if (isLLM) {
        // Pass existing names to exclude
        const res = await generateNamesLLM(formData, settings.llmConfig, currentNames);
        newSuggestions = res.suggestions;
      } else {
        // Pass current length as offset
        const res = await generateNamesLocal(formData, currentNames.length, 5);
        newSuggestions = res.suggestions;
      }

      if (newSuggestions && newSuggestions.length > 0) {
        // Add new names to the TOP of the list
        const updatedSuggestions = [...newSuggestions, ...genResult.suggestions];
        setGenResult({
          ...genResult,
          suggestions: updatedSuggestions
        });
      }

    } catch (error) {
       console.error(error);
       const errMsg = error instanceof Error ? error.message : "未知错误";
       alert(`获取更多名字失败: ${errMsg}`);
    } finally {
      setLoading({ isLoading: false, message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-cinnabar selection:text-white pb-12">
      {loading.isLoading && <LoadingOverlay message={loading.message} />}
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-cinnabar to-[#a33b43] text-white py-6 shadow-lg relative">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-widest mb-2">灵韵起名</h1>
          <p className="text-sm md:text-base opacity-90 font-light tracking-wide flex items-center justify-center gap-2">
            AI 驱动的周易八字起名大师 
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded">
              {settings.serviceMode === ServiceMode.LLM ? '大模型版' : '算法版'}
            </span>
          </p>
        </div>
        
        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute right-4 top-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="系统设置"
        >
          <CogIcon />
        </button>
      </header>

      {/* Added relative z-10 to fix overlap with header */}
      <main className="container mx-auto px-4 -mt-8 relative z-10">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-stone-100 mt-5">
          
          {/* Tabs */}
          <div className="flex border-b border-stone-200">
            <button 
              onClick={() => setMode(AppMode.GENERATE)}
              className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${mode === AppMode.GENERATE ? 'text-cinnabar border-b-2 border-cinnabar bg-red-50/30' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <SparklesIcon /> <span className="hidden md:inline">智能</span>起名
            </button>
            <button 
              onClick={() => setMode(AppMode.ANALYZE)}
              className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${mode === AppMode.ANALYZE ? 'text-cinnabar border-b-2 border-cinnabar bg-red-50/30' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <ScaleIcon /> 姓名<span className="hidden md:inline">测试</span>
            </button>
            <button 
              onClick={() => setMode(AppMode.HISTORY)}
              className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${mode === AppMode.HISTORY ? 'text-cinnabar border-b-2 border-cinnabar bg-red-50/30' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <ClockIcon /> <span className="hidden md:inline">历史</span>记录
            </button>
          </div>

          {/* Form - Only show if not in History mode */}
          {mode !== AppMode.HISTORY && (
            <div className="p-6 md:p-8 bg-gradient-to-b from-white to-stone-50">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">姓氏</label>
                    <input 
                      type="text" 
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      placeholder="如：李"
                      className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-transparent outline-none bg-white transition-shadow"
                    />
                  </div>
                  
                  {mode === AppMode.ANALYZE && (
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">名字</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="如：明"
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-transparent outline-none bg-white transition-shadow"
                      />
                    </div>
                  )}

                  {/* Name Length Selection - Only for Generate Mode */}
                  {mode === AppMode.GENERATE && (
                    <div>
                       <label className="block text-sm font-medium text-stone-600 mb-1">名字字数</label>
                       <div className="flex gap-3">
                         <button
                           type="button"
                           onClick={() => handleNameLengthChange(NameLength.DOUBLE)}
                           className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${formData.nameLength === NameLength.DOUBLE ? 'bg-red-50 border-cinnabar text-cinnabar' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                         >
                           双字 (如: 李明浩)
                         </button>
                         <button
                           type="button"
                           onClick={() => handleNameLengthChange(NameLength.SINGLE)}
                           className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${formData.nameLength === NameLength.SINGLE ? 'bg-red-50 border-cinnabar text-cinnabar' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                         >
                           单字 (如: 李明)
                         </button>
                         <button
                           type="button"
                           onClick={() => handleNameLengthChange(NameLength.RANDOM)}
                           className={`w-16 py-3 rounded-lg border text-sm font-bold transition-all ${formData.nameLength === NameLength.RANDOM ? 'bg-red-50 border-cinnabar text-cinnabar' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                         >
                           随机
                         </button>
                       </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">性别</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-all ${formData.gender === Gender.MALE ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                        <input 
                          type="radio" 
                          name="gender" 
                          value={Gender.MALE} 
                          checked={formData.gender === Gender.MALE}
                          onChange={handleInputChange}
                          className="hidden" 
                        />
                        男宝宝
                      </label>
                      <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-all ${formData.gender === Gender.FEMALE ? 'bg-pink-50 border-pink-200 text-pink-700 font-bold' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                        <input 
                          type="radio" 
                          name="gender" 
                          value={Gender.FEMALE} 
                          checked={formData.gender === Gender.FEMALE}
                          onChange={handleInputChange}
                          className="hidden" 
                        />
                        女宝宝
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">出生日期 (公历)</label>
                    <input 
                      type="date" 
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-transparent outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">出生时间</label>
                    <input 
                      type="time" 
                      name="birthTime"
                      value={formData.birthTime}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-transparent outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <button 
                    type="submit" 
                    disabled={loading.isLoading}
                    className="w-full py-4 bg-cinnabar hover:bg-[#a33b43] text-white rounded-lg font-bold text-lg shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5"
                  >
                    {mode === AppMode.GENERATE ? '立即起名' : '立即测算'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* History List View */}
          {mode === AppMode.HISTORY && (
            <div className="bg-stone-50 p-6 min-h-[400px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                  <ClockIcon />
                  <p className="mt-2">暂无历史记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleHistoryRestore(item)}
                      className="bg-white p-4 rounded-xl border border-stone-200 hover:border-cinnabar hover:shadow-md cursor-pointer transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${item.mode === AppMode.GENERATE ? 'bg-red-50 text-cinnabar' : 'bg-blue-50 text-blue-600'}`}>
                          {item.mode === AppMode.GENERATE ? <SparklesIcon /> : <ScaleIcon />}
                        </div>
                        <div>
                          <div className="font-bold text-ink text-lg">
                            {item.input.surname}{item.input.name || ''} 
                            <span className="text-sm font-normal text-stone-500 ml-2">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500">
                            {item.input.birthDate} {item.input.birthTime} · {item.input.gender} · 
                            {item.mode === AppMode.GENERATE 
                              ? ` 生成 ${(item.data as GenerationResponse).suggestions.length} 个名字` 
                              : ` 评分 ${(item.data as AnalysisResponse).score} 分`
                            }
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteHistory(e, item.id)}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="删除记录"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Generation Results View --- */}
        {mode === AppMode.GENERATE && genResult && (
          <div className="mt-8 space-y-8 animate-fade-in-up">
            
            {/* Analysis Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-serif font-bold text-ink mb-6 border-l-4 border-cinnabar pl-4">命理分析</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="grid grid-cols-4 gap-2 text-center mb-6">
                    {genResult.bazi.map((pillar, idx) => (
                      <div key={idx} className="bg-stone-100 rounded p-2">
                        <div className="text-xs text-stone-500 mb-1">{['年柱', '月柱', '日柱', '时柱'][idx]}</div>
                        <div className="font-serif text-lg font-bold text-ink">{pillar}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-stone-700">
                    <p><span className="font-bold text-ink">喜用神/缺失：</span> {genResult.missingElements.join('、')}</p>
                    <p className="text-sm text-stone-500">注：起名建议优先补足喜用神元素，以达五行平衡。</p>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-xl p-4">
                  <h4 className="text-center text-sm font-bold text-stone-500 mb-2">五行能量分布</h4>
                  <ElementRadar data={genResult.elementDistribution} />
                </div>
              </div>
            </div>

            {/* Load More Button - Centered above list */}
            <div className="flex justify-center my-6">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-cinnabar text-cinnabar rounded-full hover:bg-red-50 font-bold shadow-md transition-all active:scale-95"
              >
                <RefreshIcon />
                <span>再来几个</span>
              </button>
            </div>

            {/* Name Suggestions */}
            <div className="grid grid-cols-1 gap-6">
              {genResult.suggestions.map((name, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-stone-100">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-3xl font-serif font-bold text-cinnabar">{formData.surname}{name.characters}</h3>
                        <span className="text-stone-500 font-light">{name.pinyin}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-bold text-gold">{name.score}</span>
                        <span className="text-xs text-stone-400">分</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded">五行</span>
                        <span className="text-ink font-medium">{name.wuxing}</span>
                      </div>
                      
                      <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                        <p className="text-cinnabar font-serif text-lg mb-1">"{name.poem}"</p>
                        <p className="text-stone-600 text-sm leading-relaxed">{name.meaning}</p>
                      </div>
                      
                      <div className="pt-2 border-t border-stone-100">
                        <p className="text-sm text-stone-500"><span className="font-bold text-stone-700">大师点评：</span>{name.luckyAnalysis}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Analysis Results View --- */}
        {mode === AppMode.ANALYZE && anaResult && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in-up">
            
            {/* Score Header */}
            <div className="text-center mb-10 relative">
              <div className="inline-block relative">
                 <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f5f5f4" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      stroke={anaResult.score > 80 ? '#c04851' : anaResult.score > 60 ? '#d4af37' : '#4b5563'} 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - anaResult.score / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="block text-4xl font-bold text-ink">{anaResult.score}</span>
                    <span className="text-xs text-stone-500">综合评分</span>
                 </div>
              </div>
              <h2 className="text-3xl font-serif font-bold text-ink mt-4">{anaResult.nameCharacters}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-cinnabar rounded-full"></span> 八字排盘
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {anaResult.bazi.map((pillar, idx) => (
                        <div key={idx} className="bg-stone-100 rounded p-3">
                          <div className="text-xs text-stone-500 mb-1">{['年', '月', '日', '时'][idx]}</div>
                          <div className="font-serif font-bold text-ink">{pillar}</div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-stone-600 leading-relaxed bg-stone-50 p-3 rounded">
                      {anaResult.baziAnalysis}
                    </p>
                 </div>

                 <div>
                    <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-gold rounded-full"></span> 五行分布
                    </h3>
                    <ElementRadar data={anaResult.elementDistribution} />
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-jade rounded-full"></span> 名字寓意
                  </h3>
                  <p className="text-stone-700 leading-relaxed border-l-2 border-stone-200 pl-4">
                    {anaResult.nameMeaning}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span> 五行补救
                  </h3>
                  <p className="text-stone-700 leading-relaxed border-l-2 border-stone-200 pl-4">
                    {anaResult.wuxingBalance}
                  </p>
                </div>

                <div className="bg-stone-900 text-stone-100 p-6 rounded-xl mt-4">
                  <h3 className="font-bold text-gold mb-2">大师总评</h3>
                  <p className="leading-relaxed opacity-90">
                    {anaResult.conclusion}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
      
      <footer className="mt-16 text-center text-stone-400 text-sm pb-8">
        <p>© 2024 灵韵起名 | 仅供娱乐与文化参考，请勿迷信</p>
      </footer>
    </div>
  );
}
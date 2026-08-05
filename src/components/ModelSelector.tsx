import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, Check, Zap, ShieldCheck, RefreshCw, Cpu, Layers } from 'lucide-react';
import { FREE_AI_MODELS, DEFAULT_MODEL_ID } from '../data/freeModels';
import { AgentSettings, FreeAIModel } from '../types';

interface ModelSelectorProps {
  settings: AgentSettings;
  onUpdateSettings: (updates: Partial<AgentSettings>) => void;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  settings,
  onUpdateSettings,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModelId = settings.selectedModel || settings.aiModel || DEFAULT_MODEL_ID;
  const currentModel = FREE_AI_MODELS.find(m => m.id === currentModelId) || FREE_AI_MODELS[0];
  const autoFallback = settings.autoFallback !== false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (modelId: string) => {
    onUpdateSettings({ selectedModel: modelId, aiModel: modelId });
    setIsOpen(false);
  };

  const toggleAutoFallback = () => {
    onUpdateSettings({ autoFallback: !autoFallback });
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all border ${
          compact
            ? 'px-2.5 py-1 text-xs bg-slate-800/90 border-slate-700/80 hover:bg-slate-800 text-slate-200'
            : 'px-3 py-1.5 text-xs bg-slate-900/90 border-indigo-500/30 hover:border-indigo-500/60 text-slate-100 shadow-md'
        }`}
        title="Select AI Model"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="font-semibold truncate max-w-[140px] sm:max-w-[180px]">
            {currentModel.name}
          </span>
        </div>
        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          FREE
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Model Selection Modal/Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Free AI Model
              </span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              100% Free Tier
            </span>
          </div>

          {/* Auto Failover Switch */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Auto-Fallback Protection</div>
                <div className="text-[10px] text-slate-400">Switch models if rate-limited</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAutoFallback}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                autoFallback ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  autoFallback ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Models Grouped by Provider */}
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {/* Google Gemini Models */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 px-2 mb-1.5">
                <Layers className="w-3 h-3 text-blue-400" />
                Google Gemini Free API
              </div>
              <div className="space-y-1">
                {FREE_AI_MODELS.filter(m => m.provider === 'google').map(model => {
                  const isSelected = model.id === currentModelId;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-indigo-900/30 border-indigo-500/50 text-white shadow-inner'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{model.name}</span>
                          {model.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {model.description}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {model.speed}
                        </span>
                        <span>• {model.contextWindow}</span>
                        <span className="text-emerald-400 font-medium">• Free</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OpenRouter Free Models */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 px-2 mb-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                OpenRouter Free Models
              </div>
              <div className="space-y-1">
                {FREE_AI_MODELS.filter(m => m.provider === 'openrouter').map(model => {
                  const isSelected = model.id === currentModelId;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-indigo-900/30 border-indigo-500/50 text-white shadow-inner'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{model.name}</span>
                          {model.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {model.description}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {model.speed}
                        </span>
                        <span>• {model.contextWindow}</span>
                        <span className="text-emerald-400 font-medium">• Free</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

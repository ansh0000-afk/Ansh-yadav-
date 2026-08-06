import React, { useState } from 'react';
import { Lightbulb, Sparkles, ArrowRight, Check } from 'lucide-react';

interface DailyTipsWidgetProps {
  onApplyPrompt: (promptText: string) => void;
}

export const DAILY_TIPS = [
  {
    title: 'Code Analysis & Bug Identification',
    tip: 'Paste any complex code snippet or error stack trace and ask Alpha AI to analyze edge cases and write unit tests.',
    prompt: 'Analyze this code snippet for edge cases, performance bottlenecks, and generate unit tests:'
  },
  {
    title: 'Instant Multi-Language Translation',
    tip: 'Alpha AI supports 100+ global languages. Ask it to translate keeping native idiomatic nuances.',
    prompt: 'Translate the following text into Hindi and French with native tone:'
  },
  {
    title: 'PDF & Document OCR Parsing',
    tip: 'Upload any PDF or image document using the paperclip icon to summarize key takeaways instantly.',
    prompt: 'Extract key takeaways, summary, and action points from my attached document.'
  },
  {
    title: 'Voice-to-Voice AI Conversation',
    tip: 'Tap "Live Voice" in the top header or voice button to talk directly with your AI Agent assistant.',
    prompt: 'Let us have a live conversation about Class 12 Accountancy Partnership and Economics trends.'
  }
];

export const DailyTipsWidget: React.FC<DailyTipsWidgetProps> = ({ onApplyPrompt }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const currentTip = DAILY_TIPS[tipIndex];

  const handleNext = () => {
    setTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 shadow-xl space-y-2.5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Lightbulb className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs font-black text-white tracking-tight">AI Productivity Tip of the Day</span>
        </div>

        <button
          onClick={handleNext}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition"
        >
          Next Tip ({tipIndex + 1}/{DAILY_TIPS.length})
        </button>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-200">{currentTip.title}</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">{currentTip.tip}</p>
      </div>

      <div className="pt-1 flex justify-end">
        <button
          onClick={() => onApplyPrompt(currentTip.prompt)}
          className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
        >
          <span>Try Prompt</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

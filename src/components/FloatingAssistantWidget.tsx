import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, X, Send, Mic, Wand2, ArrowUpRight } from 'lucide-react';
import { analyzeContent } from '../lib/geminiHelper';

interface FloatingAssistantWidgetProps {
  onOpenVoiceModal?: () => void;
  onSendToMainChat?: (promptText: string) => void;
  onOpenPromptLibrary?: () => void;
}

export const FloatingAssistantWidget: React.FC<FloatingAssistantWidgetProps> = ({
  onOpenVoiceModal,
  onSendToMainChat,
  onOpenPromptLibrary
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim() || isThinking) return;

    try {
      setIsThinking(true);
      setQuickAnswer(null);

      const res = await analyzeContent({
        taskType: 'fast_edit',
        text: quickQuery
      });

      setQuickAnswer(res.result || 'Quick response generated.');
    } catch (err) {
      setQuickAnswer('Assistant busy. Click "Open in Main Chat" for full answer.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleTransferToMain = () => {
    if (quickQuery && onSendToMainChat) {
      onSendToMainChat(quickQuery);
      setQuickQuery('');
      setQuickAnswer(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-3 w-80 sm:w-96 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-4 backdrop-blur-2xl space-y-3"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-600 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Alpha Quick AI Widget</h4>
                  <p className="text-[10px] text-slate-400">Instant answer overlay</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onOpenPromptLibrary && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenPromptLibrary();
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition"
                    title="Smart Tools Library"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Answer Display */}
            {quickAnswer && (
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-indigo-500/30 text-xs text-slate-200 space-y-2 max-h-40 overflow-y-auto">
                <p className="whitespace-pre-wrap leading-relaxed">{quickAnswer}</p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleTransferToMain}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Continue in Full Chat</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleQuickSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Ask quick AI question..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!quickQuery.trim() || isThinking}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  {onOpenVoiceModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenVoiceModal();
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg flex items-center gap-1 font-semibold transition"
                    >
                      <Mic className="w-3 h-3 text-indigo-400" /> Live Voice
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTransferToMain}
                  className="text-slate-400 hover:text-white transition font-medium"
                >
                  Open Chat
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-2xl flex items-center justify-center border border-white/20 relative group"
        title="Quick AI Assistant Widget"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
      </motion.button>
    </div>
  );
};

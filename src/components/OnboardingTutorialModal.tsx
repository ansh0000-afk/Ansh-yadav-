import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bot, ShieldCheck, FileCheck, Mic, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to Alpha AI Pro Workspace',
      subtitle: 'Next-Generation Intelligent AI Assistant',
      description: 'Experience cutting-edge AI models, live voice conversations, encrypted memory vault, and multi-agent personas built for high productivity.',
      icon: Sparkles,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Step 1 of 3'
    },
    {
      title: 'PDF, Document & Visual OCR Intelligence',
      subtitle: 'Upload documents or photos for instant analysis',
      description: 'Upload PDF files, code documents, images, or snap photos using your camera. Alpha AI extracts insights, summarizes text, and solves complex problems.',
      icon: FileCheck,
      color: 'from-purple-600 to-cyan-600',
      badge: 'Step 2 of 3'
    },
    {
      title: 'AES-256 Vault & App Lock Protection',
      subtitle: 'Encrypted local storage & secure API keys',
      description: 'Your messages, API keys, and personal memory items are secured with WebCrypto AES-256 encryption, PIN protection, root integrity checks, and screenshot shields.',
      icon: ShieldCheck,
      color: 'from-cyan-600 to-emerald-600',
      badge: 'Step 3 of 3'
    }
  ];

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden text-center space-y-6">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {currentSlide.badge}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Graphic Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto"
          >
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${currentSlide.color} p-0.5 mx-auto shadow-2xl flex items-center justify-center`}>
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Icon className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white tracking-tight">{currentSlide.title}</h3>
          <p className="text-xs font-bold text-indigo-400">{currentSlide.subtitle}</p>
          <p className="text-xs text-slate-400 leading-relaxed px-2">{currentSlide.description}</p>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex justify-center items-center gap-2 pt-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-600/30 active:scale-95"
          >
            <span>{step === slides.length - 1 ? 'Get Started Now' : 'Continue'}</span>
            {step === slides.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};

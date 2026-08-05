import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Lock, Cpu, CheckCircle2, Fingerprint, ScanFace, Globe, KeyRound } from 'lucide-react';
import { DeviceSecurity, IntegrityCheckResult } from '../lib/deviceSecurity';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [integrityStatus, setIntegrityStatus] = useState<IntegrityCheckResult | null>(null);

  const securitySteps = [
    { label: 'Checking Device Root & Debugger Integrity...', icon: ShieldCheck, color: 'text-indigo-400' },
    { label: 'Verifying SSL Certificate Pinning & Transport...', icon: Globe, color: 'text-emerald-400' },
    { label: 'Initializing AES-256 WebCrypto Vault...', icon: Lock, color: 'text-purple-400' },
    { label: 'Connecting Server-Side API Proxy...', icon: KeyRound, color: 'text-amber-400' },
    { label: 'Alpha AI Core System Ready!', icon: CheckCircle2, color: 'text-cyan-400' }
  ];

  useEffect(() => {
    // Run diagnostics
    const result = DeviceSecurity.runIntegrityChecks(true);
    setIntegrityStatus(result);

    // Step progression
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < securitySteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / securitySteps.length) * 100));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-950 text-slate-100 select-none overflow-hidden"
    >
      {/* Background Glass Gradients & Glowing Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-slate-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center space-y-6">
        
        {/* Animated Brand Logo Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700 shadow-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </motion.div>

        {/* Title */}
        <div className="space-y-1">
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5"
          >
            <span>ALPHA AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold uppercase">
              PRO
            </span>
          </motion.h1>
          <p className="text-xs text-slate-400 font-medium">Encrypted & Secure AI Workspace</p>
        </div>

        {/* Security Step Status Indicator */}
        <div className="w-full space-y-3 pt-2">
          <div className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            {React.createElement(securitySteps[currentStep].icon, {
              className: `w-4 h-4 ${securitySteps[currentStep].color} animate-spin-slow shrink-0`
            })}
            <span className="text-xs font-semibold text-slate-300 truncate">
              {securitySteps[currentStep].label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold px-1">
              <span>SECURITY CHECK</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostics Badges */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            SSL Pinned
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
            AES Vault
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            Server Proxy
          </span>
        </div>
      </div>
    </motion.div>
  );
};

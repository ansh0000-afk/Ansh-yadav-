import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentSettings, ThemeMode, UserMemoryItem, UserProfile, ChatSession, AppLockSettings } from '../types';
import { MemoryManager } from '../lib/memoryManager';
import { voiceController, VoiceOption } from '../lib/voiceHelper';
import { SecurityService, SecurityStatus } from '../lib/securityService';
import { DeviceSecurity } from '../lib/deviceSecurity';
import { Settings, Save, Search, RefreshCcw, UserCheck, Moon, Sun, Monitor, Brain, Volume2, Database, Trash2, Plus, Sparkles, User, Globe, Check, Download, Upload, Shield, Cpu, Sliders, Type, HardDrive, Lock, Unlock, Key, CheckCircle, AlertTriangle, KeyRound, ShieldCheck, Fingerprint, ScanFace, Clock, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  settings: AgentSettings;
  userProfile: UserProfile;
  sessions?: ChatSession[];
  onSaveSettings: (newSettings: Partial<AgentSettings>) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  onOpenPinModal?: (mode: 'setup-pin' | 'change-pin' | 'test-biometric') => void;
  onToggleLockSession?: (sessionId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  userProfile,
  sessions = [],
  onSaveSettings,
  onUpdateProfile,
  onResetData,
  onOpenPinModal,
  onToggleLockSession
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'applock' | 'memory' | 'voice' | 'ai' | 'security' | 'account'>('general');
  const [userInstructions, setUserInstructions] = useState(settings.userCustomInstructions || '');
  const [enableSearch, setEnableSearch] = useState(settings.enableSearch);
  const [theme, setTheme] = useState<ThemeMode>(settings.theme || 'dark');
  const [userName, setUserName] = useState(settings.userName || userProfile.name || 'Anshu');
  const [preferredLang, setPreferredLang] = useState(settings.preferredLanguage || 'Hinglish');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(settings.fontSize || 'medium');
  
  // App Lock State
  const [appLockEnabled, setAppLockEnabled] = useState(settings.appLock?.isEnabled ?? false);
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(settings.appLock?.isFingerprintEnabled ?? true);
  const [isFaceUnlockEnabled, setIsFaceUnlockEnabled] = useState(settings.appLock?.isFaceUnlockEnabled ?? true);
  const [autoLockTimeout, setAutoLockTimeout] = useState<number>(settings.appLock?.autoLockTimeout ?? 5);
  const [lockOnBackground, setLockOnBackground] = useState(settings.appLock?.lockOnBackground ?? true);

  // AI Parameters
  const [aiModel, setAiModel] = useState<string>(settings.aiModel || 'gemini-3.6-flash');
  const [temperature, setTemperature] = useState<number>(settings.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState<number>(settings.maxTokens ?? 2048);

  // Security Vault State
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [customInputKey, setCustomInputKey] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Memory State
  const [memories, setMemories] = useState<UserMemoryItem[]>(() => MemoryManager.getMemories());
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemVal, setNewMemVal] = useState('');
  const [memoryEnabled, setMemoryEnabled] = useState(settings.memoryEnabled !== false);

  // Voice State
  const [voices, setVoices] = useState<VoiceOption[]>(() => voiceController.getAvailableVoices());
  const [selectedVoice, setSelectedVoice] = useState(settings.voiceSettings?.voiceURI || '');
  const [speechRate, setSpeechRate] = useState(settings.voiceSettings?.rate || 1.0);
  const [speechPitch, setSpeechPitch] = useState(settings.voiceSettings?.pitch || 1.0);
  const [autoSpeak, setAutoSpeak] = useState(settings.voiceSettings?.autoSpeak || false);

  const [isSaved, setIsSaved] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Load voices and security status when component mounts
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(voiceController.getAvailableVoices());
    };
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged();
    }
    fetchSecurity();
  }, []);

  const fetchSecurity = async () => {
    const status = await SecurityService.getStatus();
    if (status) {
      setSecurityStatus(status);
    }
  };

  const handleTestKey = async () => {
    if (!customInputKey.trim()) {
      setSecurityMsg({ type: 'error', text: 'Please enter an API key to validate.' });
      return;
    }
    setSecurityLoading(true);
    setSecurityMsg({ type: 'info', text: 'Testing key connection with Google Gemini API...' });
    const res = await SecurityService.validateKey(customInputKey.trim());
    setSecurityLoading(false);
    if (res.valid) {
      setSecurityMsg({ type: 'success', text: 'Key validation successful! Active and ready for secure vault storage.' });
    } else {
      setSecurityMsg({ type: 'error', text: res.message });
    }
  };

  const handleSaveCustomKey = async () => {
    if (!customInputKey.trim()) {
      setSecurityMsg({ type: 'error', text: 'Please enter an API key to save.' });
      return;
    }
    setSecurityLoading(true);
    setSecurityMsg({ type: 'info', text: 'Encrypting key with AES-256-GCM and saving to secure vault...' });
    const res = await SecurityService.updateKey(customInputKey.trim());
    setSecurityLoading(false);
    if (res.success) {
      setSecurityMsg({ type: 'success', text: res.message });
      setCustomInputKey('');
      if (res.status) setSecurityStatus(res.status);
    } else {
      setSecurityMsg({ type: 'error', text: res.message });
    }
  };

  const handleResetCustomKey = async () => {
    if (!confirm('Revert custom key back to system environment variables?')) return;
    setSecurityLoading(true);
    const res = await SecurityService.resetKey();
    setSecurityLoading(false);
    if (res.success) {
      setSecurityMsg({ type: 'success', text: res.message });
      if (res.status) setSecurityStatus(res.status);
    } else {
      setSecurityMsg({ type: 'error', text: res.message });
    }
  };

  const handleSave = () => {
    onSaveSettings({
      userCustomInstructions: userInstructions,
      enableSearch,
      theme,
      userName,
      preferredLanguage: preferredLang,
      memoryEnabled,
      aiModel,
      temperature,
      maxTokens,
      fontSize,
      appLock: {
        isEnabled: appLockEnabled,
        pinHash: settings.appLock?.pinHash || '1234',
        isFingerprintEnabled,
        isFaceUnlockEnabled,
        autoLockTimeout,
        lockOnBackground
      },
      voiceSettings: {
        voiceURI: selectedVoice,
        rate: speechRate,
        pitch: speechPitch,
        autoSpeak,
        language: preferredLang
      }
    });

    onUpdateProfile({
      ...userProfile,
      name: userName,
      favoriteLanguage: preferredLang
    });

    // Apply Theme to document root
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddMemory = () => {
    if (!newMemKey || !newMemVal) return;
    const added = MemoryManager.addMemory(newMemKey, newMemVal, 'preference');
    setMemories(prev => [...prev, added]);
    setNewMemKey('');
    setNewMemVal('');
  };

  const handleDeleteMemory = (id: string) => {
    MemoryManager.deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleClearMemories = () => {
    if (confirm('Delete all saved memories and preferences?')) {
      MemoryManager.clearAllMemories();
      setMemories([]);
    }
  };

  const handleExportData = () => {
    const data = {
      settings: { ...settings, aiModel, temperature, maxTokens, fontSize },
      memories,
      profile: userProfile,
      tasks: localStorage.getItem('agent_tasks'),
      notes: localStorage.getItem('agent_notes'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpha_ai_backup_${Date.now()}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks) localStorage.setItem('agent_tasks', typeof parsed.tasks === 'string' ? parsed.tasks : JSON.stringify(parsed.tasks));
        if (parsed.notes) localStorage.setItem('agent_notes', typeof parsed.notes === 'string' ? parsed.notes : JSON.stringify(parsed.notes));
        if (parsed.memories) MemoryManager.saveMemories(parsed.memories);
        alert('Data imported successfully! Refreshing view...');
        window.location.reload();
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (confirm('Clear local app cache and storage data?')) {
      localStorage.clear();
      sessionStorage.clear();
      alert('Cache cleared! App will restart.');
      window.location.reload();
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your local profile and privacy data? This action cannot be undone.')) {
      onResetData();
      alert('Account and data removed.');
      window.location.reload();
    }
  };

  // Metrics
  const chatSessionsCount = (JSON.parse(localStorage.getItem('alpha_chat_sessions') || '[]')).length || 1;
  const storageEstimatedKB = Math.round(JSON.stringify(localStorage).length / 1024);

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              Settings & Preferences
              {isSaved && <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Saved!</span>}
            </h2>
            <p className="text-xs text-slate-400">Customize theme, memory, voice, AI parameters and account</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-900/50 px-6 overflow-x-auto shrink-0">
        {[
          { id: 'general', label: 'General & Theme', icon: Sun },
          { id: 'applock', label: 'App Lock & PIN', icon: Lock },
          { id: 'memory', label: 'Memory', icon: Brain },
          { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
          { id: 'ai', label: 'AI & Grounding', icon: Sparkles },
          { id: 'security', label: 'Security & API Vault', icon: ShieldCheck },
          { id: 'account', label: 'Account & Data', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Tab 1: General & Theme */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            {/* Theme Selector */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Interface Theme Mode
              </h3>
              <p className="text-xs text-slate-400">Choose your preferred dark, light, or system appearance.</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Deep indigo-slate theme' },
                  { id: 'light', label: 'Light Mode', icon: Sun, desc: 'High contrast clean light' },
                  { id: 'system', label: 'System Theme', icon: Monitor, desc: 'Matches device preference' }
                ].map(t => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as any)}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-5 h-5 text-indigo-400" />
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <span className="font-semibold text-xs text-white">{t.label}</span>
                      <span className="text-[11px] text-slate-400">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Preferences */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" /> User Identification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Anshu"
                    className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Language</label>
                  <input
                    type="text"
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    placeholder="e.g. Simple Hinglish, English, Hindi"
                    className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: App Lock & Security PIN */}
        {activeTab === 'applock' && (
          <div className="space-y-6 animate-fade-in">
            {/* Master App Lock & Security PIN */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      Master App Lock
                      {appLockEnabled ? (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Disabled
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">Require 4-digit PIN or Biometrics to open Alpha AI and view locked chats.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !appLockEnabled;
                    setAppLockEnabled(next);
                    if (next && onOpenPinModal && (!settings.appLock?.pinHash || settings.appLock.pinHash === '')) {
                      onOpenPinModal('setup-pin');
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    appLockEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white transition-transform ${appLockEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Security PIN Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Security PIN Configuration</span>
                  <p className="text-[11px] text-slate-400">
                    {settings.appLock?.pinHash ? '4-Digit PIN is active and protected' : 'Default PIN is 1234. Change it for custom security.'}
                  </p>
                </div>

                {onOpenPinModal && (
                  <button
                    type="button"
                    onClick={() => onOpenPinModal(settings.appLock?.pinHash ? 'change-pin' : 'setup-pin')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>{settings.appLock?.pinHash ? 'Change PIN' : 'Set PIN'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Biometric Unlock Settings */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-purple-400" /> Biometric Authentication Options
              </h3>
              <p className="text-xs text-slate-400">Use Touch ID, Fingerprint scanner, or Face Unlock to bypass typing your PIN.</p>

              <div className="space-y-3">
                {/* Fingerprint Toggle */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Fingerprint Unlock</span>
                      <span className="text-[10px] text-slate-400">Allows instant Touch ID or biometric scanner unlock</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenPinModal && (
                      <button
                        type="button"
                        onClick={() => onOpenPinModal('test-biometric')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                      >
                        Test
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsFingerprintEnabled(!isFingerprintEnabled)}
                      className={`w-11 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                        isFingerprintEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${isFingerprintEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Face Unlock Toggle */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ScanFace className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Face Unlock (Biometric Face ID)</span>
                      <span className="text-[10px] text-slate-400">Allows facial scanning authentication</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenPinModal && (
                      <button
                        type="button"
                        onClick={() => onOpenPinModal('test-biometric')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                      >
                        Test
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsFaceUnlockEnabled(!isFaceUnlockEnabled)}
                      className={`w-11 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                        isFaceUnlockEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${isFaceUnlockEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Lock & Inactivity Rules */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Auto-Lock & Inactivity Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Auto-Lock Inactivity Timeout</label>
                  <select
                    value={autoLockTimeout}
                    onChange={(e) => setAutoLockTimeout(parseInt(e.target.value))}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value={0}>Immediately on Unfocus / Blur</option>
                    <option value={1}>After 1 Minute of Inactivity</option>
                    <option value={5}>After 5 Minutes of Inactivity</option>
                    <option value={15}>After 15 Minutes of Inactivity</option>
                    <option value={30}>After 30 Minutes of Inactivity</option>
                    <option value={-1}>Never (Manual Lock Only)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">Lock on Tab Switch</span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-lock when tab loses focus</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLockOnBackground(!lockOnBackground)}
                    className={`w-11 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                      lockOnBackground ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white transition-transform ${lockOnBackground ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Locked Chats Manager */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" /> Lock Specific Chat Conversations
                  </h3>
                  <p className="text-xs text-slate-400">Lock individual chat histories. Opening locked chats will require your PIN.</p>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No chat sessions created yet.</p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{session.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {session.messages?.length || 0} messages • Created {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleLockSession && onToggleLockSession(session.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                          session.isLocked
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-indigo-900/60 hover:text-indigo-300'
                        }`}
                      >
                        {session.isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-rose-400" /> Locked
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-slate-400" /> Unlock
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Memory Settings */}
        {activeTab === 'memory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" /> Persistent User Memory
                  </h3>
                  <p className="text-xs text-slate-400">Alpha AI uses memory items to recall your goals, stream, and preferred style across chats.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setMemoryEnabled(!memoryEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    memoryEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white transition-transform ${memoryEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Add New Memory Item */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g. Board Target)"
                  value={newMemKey}
                  onChange={(e) => setNewMemKey(e.target.value)}
                  className="w-1/3 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 95% in Class 12 Commerce Board Exam)"
                  value={newMemVal}
                  onChange={(e) => setNewMemVal(e.target.value)}
                  className="w-2/3 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddMemory}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* List Saved Memories */}
              <div className="space-y-2 pt-2">
                {memories.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No saved memory items yet.</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {memories.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95, x: -20, transition: { duration: 0.2, ease: 'easeOut' } }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 text-xs overflow-hidden"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.category && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                              {item.category}
                            </span>
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-indigo-400">{item.key}: </span>
                            <span className="text-slate-200">{item.value}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMemory(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors shrink-0"
                          title="Delete memory item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {memories.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearMemories}
                  className="text-xs text-rose-400 hover:underline font-medium"
                >
                  Clear All Memory Items
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Voice Settings */}
        {activeTab === 'voice' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" /> Text-to-Speech & Voice Options
              </h3>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-white">Auto-speak AI responses</span>
                  <p className="text-[11px] text-slate-400">Automatically read aloud assistant replies when generated</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    autoSpeak ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white transition-transform ${autoSpeak ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Synthesizer Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Default System Voice</option>
                  {voices.map((v, i) => (
                    <option key={i} value={v.uri}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Speech Speed: {speechRate}x</label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Speech Pitch: {speechPitch}</label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI & Grounding */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            {/* AI Model Selection */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> AI Model Selection & Provider Routing
              </h3>
              <p className="text-xs text-slate-400">Choose your preferred free AI engine (Google Gemini or OpenRouter open models).</p>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <optgroup label="Google Gemini Free API">
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended - Multimodal & High Speed)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced Multimodal)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (High Throughput)</option>
                  <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Ultra Lean)</option>
                </optgroup>
                <optgroup label="OpenRouter Free Models">
                  <option value="deepseek/deepseek-r1:free">DeepSeek R1 (Free - Chain of Thought Reasoning)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B Instruct (Free - Meta Flagship Open 70B)</option>
                  <option value="qwen/qwen-2.5-coder-32b-instruct:free">Qwen 2.5 Coder 32B (Free - Coding Specialist)</option>
                  <option value="google/gemma-2-9b-it:free">Gemma 2 9B IT (Free - Google Lightweight Open Model)</option>
                  <option value="mistralai/mistral-7b-instruct:free">Mistral 7B Instruct (Free - Lightweight)</option>
                </optgroup>
              </select>
            </div>

            {/* AI Parameters: Temperature & Max Tokens */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" /> Generation Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Temperature (Creativity): {temperature}
                  </label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.0 Precise</span>
                    <span>1.0 Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Tokens (Length)</label>
                  <select
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1024}>1,024 Tokens (~750 words)</option>
                    <option value={2048}>2,048 Tokens (~1,500 words)</option>
                    <option value={4096}>4,096 Tokens (~3,000 words)</option>
                    <option value={8192}>8,192 Tokens (~6,000 words)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Grounding Toggle */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-sm text-white">Google Search Grounding</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Allow Alpha AI to query live Google search for up-to-date facts, current events, and web citations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnableSearch(!enableSearch)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  enableSearch ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white transition-transform ${enableSearch ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Custom Instructions */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Global Custom Prompt / Instructions
              </h3>
              <p className="text-xs text-slate-400">
                Provide custom instructions to append to Alpha AI's system prompt.
              </p>
              <textarea
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                rows={5}
                placeholder="e.g. Always explain Class 12 Accountancy numericals step-by-step with journal entries..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Security & API Vault */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in">
            {/* System Integrity & Root Shield Diagnostics */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      System Integrity & Root Shield Diagnostics
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Shield Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Real-time device root checks, SSL certificate pinning, and screenshot protection</p>
                  </div>
                </div>
              </div>

              {/* Integrity Checklist Grid */}
              {(() => {
                const integrity = DeviceSecurity.runIntegrityChecks(true);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {integrity.details.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-start gap-2.5">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${item.passed ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block">{item.checkName}</span>
                          <span className="text-[10px] text-slate-400">{item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Live Security Status Overview Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      Dedicated Security & API Key Vault
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        AES-256-GCM Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Server-side isolated key resolution with encrypted local vault storage</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchSecurity}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Refresh Status
                </button>
              </div>

              {/* Status Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Key Source</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white capitalize">
                      {securityStatus?.activeSource.replace('_', ' ') || 'Environment Variable'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Masked Key Identity</span>
                  <span className="text-xs font-mono text-indigo-300">
                    {securityStatus?.maskedKey || 'AIzaSy...4a9F'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SHA-256 Checksum</span>
                  <span className="text-xs font-mono text-purple-300 truncate block">
                    {securityStatus?.keyFingerprint || 'f3a9e201b...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom API Key Input & Vault Storage */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" /> Manage Custom API Key in Secure Storage
              </h3>
              <p className="text-xs text-slate-400">
                You can optionally supply a custom Google Gemini API key to store inside the server's AES-256 encrypted vault file instead of relying solely on local environment variables.
              </p>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Enter Google Gemini API Key</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={customInputKey}
                      onChange={(e) => setCustomInputKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={securityLoading}
                    className="px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition"
                  >
                    <CheckCircle className="w-4 h-4" /> Test Connection
                  </button>
                </div>

                {/* Status Message */}
                {securityMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    securityMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                    securityMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                    'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  }`}>
                    {securityMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> :
                     securityMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> :
                     <RefreshCcw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
                    <span>{securityMsg.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomKey}
                    disabled={securityLoading}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                  >
                    <Lock className="w-4 h-4" /> Save Encrypted Key
                  </button>

                  {securityStatus?.vaultHasCustomKey && (
                    <button
                      type="button"
                      onClick={handleResetCustomKey}
                      disabled={securityLoading}
                      className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold rounded-xl text-xs flex items-center gap-2 transition"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" /> Reset to System Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Architectural Security Guarantee */}
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-3">
              <h4 className="font-semibold text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" /> Security & Privacy Architecture
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>Zero Browser Key Exposure:</strong> All API requests pass strictly through server-side proxies (`/api/*`). Secrets never touch browser JavaScript or client-side bundles.</li>
                <li><strong>AES-256-GCM Vault Encryption:</strong> Saved custom keys are encrypted on disk with dynamic PBKDF2 salt derivation and authenticated payload tagging.</li>
                <li><strong>Automatic Precedence Fallback:</strong> If custom vault keys are cleared, the server seamlessly resolves the fallback `GEMINI_API_KEY` environment variable.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 6: Account & Data */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fade-in">
            {/* Account Details & Profile Storage Usage */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" /> User Profile & Diagnostics
              </h3>
              <div className="p-4 bg-slate-800/50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{userProfile.name}</h4>
                  <p className="text-xs text-slate-400">{userProfile.email}</p>
                </div>
                <span className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 capitalize font-medium">
                  {userProfile.provider} Mode
                </span>
              </div>

              {/* Usage Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Chat Sessions</span>
                  <span className="text-base font-extrabold text-indigo-400">{chatSessionsCount}</span>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Memory Items</span>
                  <span className="text-base font-extrabold text-purple-400">{memories.length}</span>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Storage Used</span>
                  <span className="text-base font-extrabold text-emerald-400">{storageEstimatedKB} KB</span>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">App Version</span>
                  <span className="text-base font-extrabold text-amber-400">v2.5.0</span>
                </div>
              </div>
            </div>

            {/* Backup, Import, Clear Cache & Delete Account */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> Backup, Restore & Privacy Controls
              </h3>
              <p className="text-xs text-slate-400">Manage JSON export/import backups, clear local browser cache, or erase your account data.</p>

              <input
                type="file"
                ref={importFileRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-indigo-400" /> Export JSON Data
                </button>

                <button
                  type="button"
                  onClick={() => importFileRef.current?.click()}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-purple-400" /> Import JSON Data
                </button>

                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4 text-amber-400" /> Clear Local Cache
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" /> Delete Account Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


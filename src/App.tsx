import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { TaskBoardView } from './components/TaskBoardView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { PersonaSelectorView } from './components/PersonaSelectorView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import { AppLockModal } from './components/AppLockModal';
import { SplashScreen } from './components/SplashScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SmartPromptLibraryModal } from './components/SmartPromptLibraryModal';
import { FloatingAssistantWidget } from './components/FloatingAssistantWidget';
import { OnboardingTutorialModal } from './components/OnboardingTutorialModal';
import { DashboardView } from './components/DashboardView';
import { AIWorkspaceToolsView } from './components/AIWorkspaceToolsView';
import { CommerceStudyHubView } from './components/CommerceStudyHubView';
import { DeviceSecurity } from './lib/deviceSecurity';
import { AnimatePresence, motion } from 'motion/react';
import { Shield, EyeOff, ShieldAlert } from 'lucide-react';
import { DEFAULT_PERSONAS } from './data/defaultPersonas';
import { AgentPersona, ChatMessage, ChatSession, Task, KnowledgeNote, AgentSettings, UserProfile, DocumentAttachment, AppLockSettings, CalendarEvent } from './types';
import { memoryManager } from './lib/memoryManager';
import { apiFetch } from './lib/apiClient';
import { auth, onAuthStateChanged } from './lib/firebase';

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Class 12 Accountancy: Reconstitution of Partnership & Goodwill',
    description: 'Solve textbook numericals for Super Profit Method and Capitalisation Method.',
    priority: 'high',
    status: 'in_progress',
    dueDate: 'Today',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    title: 'Business Studies: Principles of Management Case Studies',
    description: 'Revise Henri Fayol 14 Principles and Taylor Scientific Management techniques.',
    priority: 'medium',
    status: 'todo',
    dueDate: 'Tomorrow',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_NOTES: KnowledgeNote[] = [
  {
    id: 'n-1',
    title: 'Class 12 Commerce Board Exam Master Guide',
    content: `### High-Impact Revision Strategy for Class 12 Commerce:
- **Accountancy**: Daily 3 numericals on Partnership Fundamentals, Reconstitution, and Pro-rata Share Forfeiture.
- **Business Studies**: Practice case studies on Principles of Management and Financial Management (Trading on Equity).
- **Economics**: Master National Income calculation methods and Investment Multiplier formulas.
- **English & Hindi**: Memorize Literature chapter summaries and writing skill formats (Notices, Letters, Bio-data).`,
    category: 'Studies',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SESSION: ChatSession = {
  id: 'session-default',
  title: 'Welcome to Class 12 Commerce AI',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: []
};

export default function App() {
  const [currentView, setCurrentView] = useState<any>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'cal-1',
      title: 'Class 12 Accountancy Partnership Practice',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      category: 'study',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-2',
      title: 'Macroeconomics National Income Numericals',
      date: new Date().toISOString().split('T')[0],
      time: '17:30',
      category: 'study',
      createdAt: new Date().toISOString()
    }
  ]);
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => memoryManager.getProfile());

  // Personas
  const [personas] = useState<AgentPersona[]>(DEFAULT_PERSONAS);
  const [activePersona, setActivePersona] = useState<AgentPersona>(() => {
    const saved = localStorage.getItem('agent_active_persona_id');
    return DEFAULT_PERSONAS.find(p => p.id === saved) || DEFAULT_PERSONAS[0];
  });

  // Settings
  const [settings, setSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('agent_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      activePersonaId: activePersona.id,
      enableSearch: true,
      enableVoiceResponse: true,
      preferredLanguage: 'Hinglish',
      voiceSettings: {
        voiceURI: '',
        rate: 1.0,
        pitch: 1.0,
        autoSpeak: false
      },
      userCustomInstructions: 'Always reply in simple Hinglish step by step. Help me with Class 12 Commerce studies (Accountancy, Business Studies, Economics, English, Hindi, Computer Applications, Entrepreneurship, Physical Education) in a friendly and accurate manner.'
    };
  });

  // Chat History Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('alpha_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [DEFAULT_SESSION];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('alpha_active_session_id');
    return saved && sessions.some(s => s.id === saved) ? saved : sessions[0]?.id || DEFAULT_SESSION.id;
  });

  // Derived messages for current active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || DEFAULT_SESSION;
  const messages = activeSession ? activeSession.messages : [];

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('agent_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  // Notes State
  const [notes, setNotes] = useState<KnowledgeNote[]>(() => {
    const saved = localStorage.getItem('agent_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('alpha_splash_shown');
  });

  // Window Focus / Privacy Blur State
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);
  const [screenshotToast, setScreenshotToast] = useState<boolean>(false);

  // Screenshot Prevention Listener
  useEffect(() => {
    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const cleanupScreenshot = DeviceSecurity.enableScreenshotPrevention(() => {
      setScreenshotToast(true);
      setTimeout(() => setScreenshotToast(false), 3500);
    });

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      cleanupScreenshot();
    };
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('alpha_splash_shown', 'true');
    setShowSplash(false);
  };

  // App Lock State
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const savedSettings = localStorage.getItem('agent_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.appLock?.isEnabled && parsed.appLock?.pinHash) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    mode: 'unlock-app' | 'unlock-chat' | 'setup-pin' | 'change-pin' | 'test-biometric';
    targetChatId?: string;
    targetChatTitle?: string;
  }>({ isOpen: false, mode: 'unlock-app' });

  const [unlockedSessionIds, setUnlockedSessionIds] = useState<string[]>([]);

  // Smart Tools & Onboarding Modals State
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('alpha_onboarding_completed');
  });

  // Tab visibility change (Auto-lock on background / tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && settings.appLock?.isEnabled && settings.appLock?.lockOnBackground) {
        setIsAppLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.appLock?.isEnabled, settings.appLock?.lockOnBackground]);

  // Auto lock inactivity timer
  useEffect(() => {
    if (!settings.appLock?.isEnabled || settings.appLock?.autoLockTimeout === undefined || settings.appLock.autoLockTimeout < 0) {
      return;
    }

    const timeoutMs = settings.appLock.autoLockTimeout * 60 * 1000;
    if (timeoutMs === 0) return; // Immediate on blur is handled by visibilitychange

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsAppLocked(true);
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [settings.appLock?.isEnabled, settings.appLock?.autoLockTimeout]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('agent_active_persona_id', activePersona.id);
  }, [activePersona]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUserProfile(prev => {
          const providerId = firebaseUser.providerData[0]?.providerId || 'email';
          const providerType = providerId.includes('google') ? 'google' : 'email';
          const updated: UserProfile = {
            ...prev,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || prev.name || firebaseUser.email?.split('@')[0] || 'Alpha User',
            email: firebaseUser.email || prev.email || '',
            avatar: firebaseUser.photoURL || prev.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
            provider: providerType,
            isLoggedIn: true,
            emailVerified: firebaseUser.emailVerified
          };
          memoryManager.saveProfile(updated);
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('agent_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('alpha_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('alpha_active_session_id', activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem('agent_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('agent_notes', JSON.stringify(notes));
  }, [notes]);

  // Session Handlers
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session?.isLocked && !unlockedSessionIds.includes(id)) {
      setPinModalState({
        isOpen: true,
        mode: 'unlock-chat',
        targetChatId: id,
        targetChatTitle: session.title
      });
      return;
    }
    setActiveSessionId(id);
  };

  const handleToggleLockSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isLocked: !s.isLocked } : s));
  };

  const handlePinModalSuccess = (newPin?: string) => {
    if (pinModalState.mode === 'unlock-app') {
      setIsAppLocked(false);
    } else if (pinModalState.mode === 'unlock-chat' && pinModalState.targetChatId) {
      setUnlockedSessionIds(prev => [...prev, pinModalState.targetChatId!]);
      setActiveSessionId(pinModalState.targetChatId);
    } else if (pinModalState.mode === 'setup-pin' || pinModalState.mode === 'change-pin') {
      if (newPin) {
        setSettings(prev => ({
          ...prev,
          appLock: {
            isEnabled: true,
            pinHash: newPin,
            isFingerprintEnabled: prev.appLock?.isFingerprintEnabled ?? true,
            isFaceUnlockEnabled: prev.appLock?.isFaceUnlockEnabled ?? true,
            autoLockTimeout: prev.appLock?.autoLockTimeout ?? 5,
            lockOnBackground: prev.appLock?.lockOnBackground ?? true
          }
        }));
      }
    }
    setPinModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleResetAppLock = () => {
    setSettings(prev => ({
      ...prev,
      appLock: {
        isEnabled: false,
        pinHash: '',
        isFingerprintEnabled: true,
        isFaceUnlockEnabled: true,
        autoLockTimeout: 5,
        lockOnBackground: true
      }
    }));
    setIsAppLocked(false);
    setPinModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const fresh = {
          id: `session-${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handlePinSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const handleFavoriteSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const handleArchiveSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isArchived: !s.isArchived } : s));
  };

  const handleDuplicateSession = (id: string) => {
    const sessionToDup = sessions.find(s => s.id === id);
    if (!sessionToDup) return;
    const newSession: ChatSession = {
      ...sessionToDup,
      id: `session-${Date.now()}`,
      title: `${sessionToDup.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: sessionToDup.messages.map(m => ({ ...m, id: `${m.id}-dup-${Date.now()}` }))
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  // Update messages in current active session
  const updateSessionMessages = (newMessages: ChatMessage[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        // Auto generate session title from first user message if still default
        let newTitle = s.title;
        if ((s.title === 'Welcome to Alpha AI' || s.title === 'New Conversation') && newMessages.length > 0) {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '...' : '');
          }
        }
        return {
          ...s,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: newMessages
        };
      }
      return s;
    }));
  };

  // Handle Send Message
  const handleSendMessage = async (content: string, attachedImage?: string, attachedDoc?: DocumentAttachment) => {
    let finalContent = content;
    if (attachedDoc && attachedDoc.textContent) {
      finalContent = `${content}\n\n[Attached Document: "${attachedDoc.name}" (${attachedDoc.type}, ${attachedDoc.pageCount || 1} pages)]:\n\n${attachedDoc.textContent.slice(0, 10000)}`;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content, // Display clean input
      attachedImage,
      attachedDoc,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    updateSessionMessages(updatedMessages);
    setIsLoading(true);

    // Setup AbortController for cancel capability
    abortControllerRef.current = new AbortController();

    try {
      // Build prompt list with document content included in API call
      const apiMessages = updatedMessages.map(m => {
        if (m.id === userMsg.id && attachedDoc) {
          return { ...m, content: finalContent };
        }
        return m;
      });

      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: apiMessages,
          persona: activePersona,
          settings,
          tasks,
          notes,
          userProfile,
          userMemory: memoryManager.getMemories(),
          attachedImage
        })
      });

      if (!res.ok) {
        throw new Error(res.error || res.data?.error || 'Agent call failed');
      }

      const data = res.data;

      // Handle tool executions (Tasks & Notes creation)
      if (data.toolExecutions && Array.isArray(data.toolExecutions)) {
        for (const tool of data.toolExecutions) {
          if (tool.name === 'create_task' && tool.args?.title) {
            const newTask: Task = {
              id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: tool.args.title,
              description: tool.args.description,
              priority: tool.args.priority || 'medium',
              status: 'todo',
              dueDate: tool.args.dueDate,
              createdAt: new Date().toISOString()
            };
            setTasks(prev => [newTask, ...prev]);
          } else if (tool.name === 'save_note' && tool.args?.title && tool.args?.content) {
            const newNote: KnowledgeNote = {
              id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: tool.args.title,
              content: tool.args.content,
              category: tool.args.category || 'General',
              createdAt: new Date().toISOString()
            };
            setNotes(prev => [newNote, ...prev]);
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'Action completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
        toolExecutions: data.toolExecutions,
        imageUrl: data.generatedImageUrl
      };

      updateSessionMessages([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation stopped by user');
        return;
      }
      console.error('Send message error:', err);
      const isQuota = err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('429');
      const errorMsgText = isQuota
        ? '⚠️ **Rate Limit Reached**: Gemini API ki limit reach ho gayi hai. Kripya 30-60 seconds ruko aur dobara send karo.'
        : `⚠️ **Server Note**: Request process karte waqt thodi dikkat aayi (${err.message || 'Network issue'}). Please try again.`;

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateSessionMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  // Task Handlers
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [task, ...prev]);
  };

  const handleUpdateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAskAgentAboutTask = (taskTitle: string) => {
    setCurrentView('chat');
    handleSendMessage(`Help me execute and complete this task step by step: "${taskTitle}"`);
  };

  // Note Handlers
  const handleAddNote = (newNote: Omit<KnowledgeNote, 'id' | 'createdAt'>) => {
    const note: KnowledgeNote = {
      ...newNote,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [note, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAskAgentAboutNote = (noteTitle: string) => {
    setCurrentView('chat');
    handleSendMessage(`Provide additional insights and revision notes for: "${noteTitle}"`);
  };

  // Reset Data
  const handleResetData = () => {
    setTasks([]);
    setNotes([]);
    setSessions([DEFAULT_SESSION]);
    setActiveSessionId(DEFAULT_SESSION.id);
    localStorage.clear();
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100 relative">
        
        {/* Animated Splash Screen */}
        <AnimatePresence>
          {showSplash && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}
        </AnimatePresence>

        {/* Screenshot / Tab Unfocus Privacy Shield Overlay */}
        {isWindowBlurred && settings.appLock?.isEnabled && (
          <div className="fixed inset-0 z-100 bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center space-y-3 pointer-events-auto select-none p-6 text-center">
            <div className="p-4 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
              <EyeOff className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-white">Protected Workspace View</h2>
            <p className="text-xs text-slate-400 max-w-xs">Screen content hidden to prevent unauthorized capture or background window peek.</p>
          </div>
        )}

        {/* Screenshot Detected Toast Alert */}
        <AnimatePresence>
          {screenshotToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-rose-950/90 border border-rose-500/40 text-rose-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>Screenshot / Screen Recording Detected — Protected Content</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          activePersona={activePersona}
          personas={personas}
          onSelectPersona={setActivePersona}
          taskCount={tasks.filter(t => t.status !== 'completed').length}
          noteCount={notes.length}
          enableSearch={settings.enableSearch}
          setEnableSearch={(enabled) => setSettings(s => ({ ...s, enableSearch: enabled }))}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onPinSession={handlePinSession}
          onFavoriteSession={handleFavoriteSession}
          onArchiveSession={handleArchiveSession}
          onDuplicateSession={handleDuplicateSession}
          onToggleLockSession={handleToggleLockSession}
          onRenameSession={handleRenameSession}
          userProfile={userProfile}
          onOpenAuth={() => setIsAuthOpen(true)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          {currentView === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              sessions={sessions}
              tasks={tasks}
              notes={notes}
              calendarEvents={calendarEvents}
              onNavigateView={(view) => setCurrentView(view)}
              onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              onQuickStartChat={(promptText) => {
                setCurrentView('chat');
                handleSendMessage(promptText);
              }}
              onAddTask={handleAddTask}
              onAddCalendarEvent={(evt) => {
                setCalendarEvents(prev => [...prev, { ...evt, id: `cal-${Date.now()}`, createdAt: new Date().toISOString() }]);
              }}
            />
          )}

          {currentView === 'commerce' && (
            <CommerceStudyHubView
              onAskAgentAboutTopic={(topic) => {
                setCurrentView('chat');
                handleSendMessage(`Explain this Class 12 Commerce concept in detail with examples and step-by-step notes: ${topic}`);
              }}
            />
          )}

          {currentView === 'tools' && (
            <AIWorkspaceToolsView
              onSendMessageToChat={(promptText) => {
                setCurrentView('chat');
                handleSendMessage(promptText);
              }}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              activePersona={activePersona}
              personas={DEFAULT_PERSONAS}
              onSelectPersona={setActivePersona}
              activeSession={activeSession}
              enableSearch={settings.enableSearch}
              setEnableSearch={(enabled) => setSettings(s => ({ ...s, enableSearch: enabled }))}
              onClearChat={() => updateSessionMessages([])}
              isLoading={isLoading}
              onStopGenerating={handleStopGenerating}
              tasks={tasks}
              notes={notes}
              settings={settings}
              onUpdateSettings={(updates) => setSettings(s => ({ ...s, ...updates }))}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
              onDuplicateSession={handleDuplicateSession}
              onPinSession={handlePinSession}
              onFavoriteSession={handleFavoriteSession}
              onArchiveSession={handleArchiveSession}
            />
          )}

          {currentView === 'tasks' && (
            <TaskBoardView
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onAskAgentAboutTask={handleAskAgentAboutTask}
            />
          )}

          {currentView === 'notes' && (
            <KnowledgeBaseView
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onAskAgentAboutNote={handleAskAgentAboutNote}
            />
          )}

          {currentView === 'personas' && (
            <PersonaSelectorView
              personas={personas}
              activePersona={activePersona}
              onSelectPersona={setActivePersona}
              onSwitchToChat={() => setCurrentView('chat')}
            />
          )}

          {currentView === 'settings' && (
            <SettingsModal
              settings={settings}
              userProfile={userProfile}
              sessions={sessions}
              onSaveSettings={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
              onUpdateProfile={(updated) => {
                memoryManager.saveProfile(updated);
                setUserProfile(updated);
              }}
              onResetData={handleResetData}
              onOpenPinModal={(mode) => setPinModalState({ isOpen: true, mode })}
              onToggleLockSession={handleToggleLockSession}
            />
          )}
        </main>

        {/* Floating Glassmorphic Bottom Navigation Bar */}
        <BottomNavigation
          activeView={currentView === 'notes' ? 'tasks' : currentView}
          onSelectView={(view) => {
            if (view === 'security') {
              setCurrentView('settings');
            } else {
              setCurrentView(view as any);
            }
          }}
          activeSessionTitle={activeSession.title}
          isAppLockEnabled={settings.appLock?.isEnabled}
          taskCount={tasks.filter(t => t.status !== 'completed').length}
        />

        {/* App Security Lock Screen Overlay */}
        {isAppLocked && settings.appLock?.isEnabled && (
          <AppLockModal
            mode="unlock-app"
            appLockSettings={settings.appLock}
            onSuccess={() => setIsAppLocked(false)}
            onResetAppLock={handleResetAppLock}
          />
        )}

        {/* Action / Lock / PIN Setup Modal */}
        {pinModalState.isOpen && (
          <AppLockModal
            mode={pinModalState.mode}
            targetChatTitle={pinModalState.targetChatTitle}
            appLockSettings={settings.appLock}
            onSuccess={handlePinModalSuccess}
            onCancel={() => setPinModalState(prev => ({ ...prev, isOpen: false }))}
            onResetAppLock={handleResetAppLock}
          />
        )}

        {/* Auth & Profile Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          userProfile={userProfile}
          onUpdateProfile={(updated) => {
            memoryManager.saveProfile(updated);
            setUserProfile(updated);
          }}
          onClose={() => setIsAuthOpen(false)}
        />

        {/* Live Voice Conversation Modal */}
        <VoiceConversationModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          activePersona={activePersona}
          settings={settings}
          onSendMessageToChat={handleSendMessage}
        />

        {/* Smart Prompt Library & AI Writing/Coding Suite Modal */}
        <SmartPromptLibraryModal
          isOpen={isPromptLibraryOpen}
          onClose={() => setIsPromptLibraryOpen(false)}
          onSelectPrompt={(promptText) => {
            if (currentView !== 'chat') setCurrentView('chat');
            handleSendMessage(promptText);
          }}
        />

        {/* Onboarding Tutorial Modal */}
        <OnboardingTutorialModal
          isOpen={isOnboardingOpen}
          onClose={() => {
            localStorage.setItem('alpha_onboarding_completed', 'true');
            setIsOnboardingOpen(false);
          }}
        />

        {/* Floating AI Assistant Quick Overlay Widget */}
        <FloatingAssistantWidget
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          onSendToMainChat={(promptText) => {
            if (currentView !== 'chat') setCurrentView('chat');
            handleSendMessage(promptText);
          }}
        />
      </div>
    </ErrorBoundary>
  );
}


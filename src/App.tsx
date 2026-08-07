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
        if ((s.title === 'Welcome to Class 12 Commerce AI' || s.title === 'New Conversation') && newMessages.length > 0) {
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

      const res = await fetch('/api/chat', {
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

      // 1. First check if response is OK (200)
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server call failed with status ${res.status}: ${errorText.slice(0, 100)}`);
      }

      // 2. Safe JSON Parsing
      const data = await res.json();

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

      const assistantMsg: ChatMessage = 

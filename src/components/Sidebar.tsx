import React, { useState } from 'react';
import { AgentPersona, ChatSession, UserProfile } from '../types';
import { formatDateTime } from '../lib/chatUtils';
import { 
  MessageSquare, 
  CheckSquare, 
  BookOpen, 
  Users, 
  Settings, 
  Sparkles, 
  Plus,
  Search,
  Pin,
  Star,
  Archive,
  Trash2,
  Edit2,
  Copy,
  Check,
  X,
  User,
  ChevronDown,
  ChevronRight,
  Radio,
  Lock,
  Unlock,
  LayoutDashboard,
  Wand2,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: any;
  setCurrentView: (view: any) => void;
  activePersona: AgentPersona;
  personas: AgentPersona[];
  onSelectPersona: (persona: AgentPersona) => void;
  taskCount: number;
  noteCount: number;
  enableSearch: boolean;
  setEnableSearch: (enabled: boolean) => void;
  // Chat History Sessions
  sessions: ChatSession[];
  activeSessionId: string;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onPinSession: (id: string) => void;
  onFavoriteSession?: (id: string) => void;
  onArchiveSession?: (id: string) => void;
  onDuplicateSession?: (id: string) => void;
  onToggleLockSession?: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  // User Profile
  userProfile: UserProfile;
  onOpenAuth: () => void;
  // Mobile drawer control
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  // Live Voice Mode
  onOpenVoiceModal?: () => void;
  onOpenPromptLibrary?: () => void;
  onOpenOnboarding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  activePersona,
  personas,
  onSelectPersona,
  taskCount,
  noteCount,
  enableSearch,
  setEnableSearch,
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onPinSession,
  onFavoriteSession,
  onArchiveSession,
  onDuplicateSession,
  onToggleLockSession,
  onRenameSession,
  userProfile,
  onOpenAuth,
  isOpenMobile,
  onCloseMobile,
  onOpenVoiceModal,
  onOpenPromptLibrary,
  onOpenOnboarding
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  // Search filter matching title OR message content
  const matchesSearch = (s: ChatSession) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = s.title.toLowerCase().includes(q);
    const matchContent = s.messages.some(m => m.content.toLowerCase().includes(q));
    return matchTitle || matchContent;
  };

  const filteredSessions = sessions.filter(matchesSearch);

  const pinnedSessions = filteredSessions.filter(s => s.isPinned && !s.isArchived);
  const favoriteSessions = filteredSessions.filter(s => s.isFavorite && !s.isPinned && !s.isArchived);
  const recentSessions = filteredSessions.filter(s => !s.isPinned && !s.isFavorite && !s.isArchived);
  const archivedSessions = filteredSessions.filter(s => s.isArchived);

  const handleStartRename = (e: React.MouseEvent, s: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(s.id);
    setEditingTitle(s.title);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId && currentView === 'chat';
    const isEditing = editingSessionId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          if (!isEditing) {
            onSelectSession(session.id);
            setCurrentView('chat');
            if (onCloseMobile) onCloseMobile();
          }
        }}
        title={`Created: ${formatDateTime(session.createdAt)}\nUpdated: ${formatDateTime(session.updatedAt)}`}
        className={`group relative p-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 flex items-center justify-between ${
          isActive
            ? 'bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2 flex-1">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${
            session.isPinned ? 'text-amber-400' : session.isFavorite ? 'text-yellow-400' : session.isArchived ? 'text-slate-500' : 'text-indigo-400/80'
          }`} />
          
          {isEditing ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(session.id);
                  if (e.key === 'Escape') setEditingSessionId(null);
                }}
                className="bg-slate-950 border border-indigo-500 text-xs text-white rounded px-2 py-0.5 w-full focus:outline-none"
              />
              <button
                onClick={() => handleSaveRename(session.id)}
                className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setEditingSessionId(null)}
                className="p-1 text-slate-400 hover:bg-slate-800 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="truncate text-[12px] leading-tight">{session.title}</p>
                {session.isLocked && (
                  <span title="Protected with App Lock PIN">
                    <Lock className="w-3 h-3 text-rose-400 shrink-0 inline" />
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-500 truncate font-mono">
                {session.messages?.length || 0} msgs • {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* Hover Action Bar */}
        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 shrink-0 bg-slate-900/95 px-1 py-0.5 rounded-lg border border-slate-700/80 shadow-md">
            {/* Lock toggle */}
            {onToggleLockSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLockSession(session.id);
                }}
                className={`p-1 rounded hover:bg-slate-800 transition ${session.isLocked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'}`}
                title={session.isLocked ? 'Unlock Chat' : 'Lock Chat with PIN'}
              >
                {session.isLocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}

            {/* Pin */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPinSession(session.id);
              }}
              className={`p-1 rounded hover:bg-slate-800 transition ${session.isPinned ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
              title={session.isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-3 h-3" />
            </button>

            {/* Favorite */}
            {onFavoriteSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteSession(session.id);
                }}
                className={`p-1 rounded hover:bg-slate-800 transition ${session.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}
                title={session.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
              >
                <Star className="w-3 h-3" />
              </button>
            )}

            {/* Rename */}
            <button
              onClick={(e) => handleStartRename(e, session)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition"
              title="Rename inline"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Duplicate */}
            {onDuplicateSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateSession(session.id);
                }}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition"
                title="Duplicate chat"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}

            {/* Archive */}
            {onArchiveSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchiveSession(session.id);
                }}
                className={`p-1 rounded hover:bg-slate-800 transition ${session.isArchived ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                title={session.isArchived ? 'Unarchive' : 'Archive'}
              >
                <Archive className="w-3 h-3" />
              </button>
            )}

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
              title="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen select-none shrink-0 z-30 transition-transform ${
      isOpenMobile ? 'translate-x-0 fixed inset-y-0 left-0 shadow-2xl' : 'max-md:hidden'
    }`}>
      {/* Top Branding & New Chat */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-indigo-500/20">
              α
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">Alpha AI</h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase mt-1">
                Think. Build. Learn.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title="User Profile & Auth"
          >
            <User className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        {/* New Chat Button & Live Voice Button */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => {
              onNewSession();
              setCurrentView('chat');
              if (onCloseMobile) onCloseMobile();
            }}
            className="col-span-4 py-2.5 px-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {onOpenVoiceModal && (
            <button
              onClick={() => {
                onOpenVoiceModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all relative group"
              title="Start Gemini Live Voice Conversation"
            >
              <Radio className="w-4 h-4 animate-pulse" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="px-3 pt-3 space-y-1">
        <button
          onClick={() => {
            setCurrentView('dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'dashboard'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
            PRO
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentView('commerce');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'commerce'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Class 12 Commerce</span>
          </div>
          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold border border-amber-500/30">
            HUB
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentView('chat');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'chat'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>AI Workspace Chat</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
            {sessions.length}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentView('tools');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'tools'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Wand2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI Smart Tools Hub</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
            25+
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentView('tasks');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'tasks'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Action Board</span>
          </div>
          {taskCount > 0 && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              {taskCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentView('notes');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'notes'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Knowledge Base</span>
          </div>
          {noteCount > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
              {noteCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 border-t border-slate-800 mt-3">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search titles & messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 text-[10px]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <p className="text-[11px] text-slate-500 px-2 italic">No matching conversations.</p>
        ) : (
          <div className="space-y-3">
            {/* PINNED CHATS SECTION */}
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  <Pin className="w-3 h-3" />
                  <span>Pinned Chats ({pinnedSessions.length})</span>
                </div>
                <div className="space-y-0.5">
                  {pinnedSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* FAVORITE CHATS SECTION */}
            {favoriteSessions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  <span>Favorites ({favoriteSessions.length})</span>
                </div>
                <div className="space-y-0.5">
                  {favoriteSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* RECENT CHATS SECTION */}
            {recentSessions.length > 0 && (
              <div className="space-y-1">
                {(pinnedSessions.length > 0 || favoriteSessions.length > 0) && (
                  <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent Conversations
                  </div>
                )}
                <div className="space-y-0.5">
                  {recentSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* ARCHIVED CHATS SECTION */}
            {archivedSessions.length > 0 && (
              <div className="pt-2 border-t border-slate-800/60 space-y-1">
                <button
                  onClick={() => setIsArchivedExpanded(!isArchivedExpanded)}
                  className="w-full flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-wider transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3 h-3 text-slate-500" />
                    <span>Archived ({archivedSessions.length})</span>
                  </div>
                  {isArchivedExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  )}
                </button>
                {isArchivedExpanded && (
                  <div className="space-y-0.5 animate-in fade-in duration-150">
                    {archivedSessions.map(renderSessionItem)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings & Footer Controls */}
      <div className="p-3 border-t border-slate-800 space-y-1.5 bg-slate-900/80">
        {onOpenPromptLibrary && (
          <button
            onClick={() => {
              onOpenPromptLibrary();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition border border-indigo-500/30 bg-indigo-950/30"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Smart Tools & Prompts</span>
            </div>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
              PRO
            </span>
          </button>
        )}

        <button
          onClick={() => {
            setCurrentView('personas');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'personas'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-violet-400" />
            <span>AI Personas</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{personas.length}</span>
        </button>

        <button
          onClick={() => {
            setCurrentView('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
            currentView === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {/* User Account Bar */}
        <div
          onClick={onOpenAuth}
          className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-slate-600 transition mt-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={userProfile.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">{userProfile.name}</p>
              <p className="text-[10px] text-indigo-400 capitalize truncate font-medium">{userProfile.provider} mode</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};



import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentPersona, ChatMessage, Task, KnowledgeNote, DocumentAttachment, AgentSettings, ChatSession } from '../types';
import { extractTextFromPDF } from '../lib/pdfHelper';
import { voiceController } from '../lib/voiceHelper';
import { exportChatToPDF, exportChatToTXT, exportChatSession } from '../lib/export';
import { copyConversationToClipboard, shareChatSession, formatDateTime } from '../lib/chatUtils';
import { ConfirmationModal } from './ConfirmationModal';
import { RenameModal } from './RenameModal';
import { ModelSelector } from './ModelSelector';
import { 
  Send, 
  Paperclip, 
  Search, 
  Sparkles, 
  Image as ImageIcon, 
  Volume2, 
  VolumeX,
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  RefreshCw,
  Trash2,
  X,
  Bot,
  User,
  Wand2,
  Mic,
  MicOff,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Edit3,
  Share2,
  Square,
  FileCode,
  Menu,
  Camera,
  FileCheck,
  Download,
  ChevronDown,
  SlidersHorizontal,
  Pin,
  Star,
  Archive
} from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, attachedImage?: string, attachedDoc?: DocumentAttachment) => Promise<void>;
  activePersona: AgentPersona;
  personas?: AgentPersona[];
  onSelectPersona?: (persona: AgentPersona) => void;
  activeSession: ChatSession;
  enableSearch: boolean;
  setEnableSearch: (enabled: boolean) => void;
  onClearChat: () => void;
  isLoading: boolean;
  onStopGenerating?: () => void;
  tasks: Task[];
  notes: KnowledgeNote[];
  settings: AgentSettings;
  onUpdateSettings: (updates: Partial<AgentSettings>) => void;
  onRegenerateLast?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenVoiceModal?: () => void;
  onOpenPromptLibrary?: () => void;
  // Session Handlers
  onRenameSession?: (id: string, newTitle: string) => void;
  onDeleteSession?: (id: string) => void;
  onDuplicateSession?: (id: string) => void;
  onPinSession?: (id: string) => void;
  onFavoriteSession?: (id: string) => void;
  onArchiveSession?: (id: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  activePersona,
  personas = [],
  onSelectPersona,
  activeSession,
  enableSearch,
  setEnableSearch,
  onClearChat,
  isLoading,
  onStopGenerating,
  tasks,
  notes,
  settings,
  onUpdateSettings,
  onRegenerateLast,
  onOpenMobileMenu,
  onOpenVoiceModal,
  onOpenPromptLibrary,
  onRenameSession,
  onDeleteSession,
  onDuplicateSession,
  onPinSession,
  onFavoriteSession,
  onArchiveSession
}) => {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<DocumentAttachment | null>(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  
  // Voice STT State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  // Audio Speech State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  
  // Editing Prompt State
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Feedbacks
  const [messageFeedbacks, setMessageFeedbacks] = useState<Record<string, 'like' | 'dislike'>>({});

  // Options Dropdown & Modals State
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Click outside to close options dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Recognition STT
  const toggleVoiceInput = () => {
    if (isListening) {
      voiceController.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceController.startListening(
        (transcript, isFinal) => {
          setInput(transcript);
          setVoiceTranscript(transcript);
          if (isFinal) {
            setIsListening(false);
          }
        },
        (err) => {
          console.error('STT error:', err);
          setIsListening(false);
        },
        () => setIsListening(false),
        settings.preferredLanguage?.includes('Hindi') ? 'hi-IN' : 'en-US'
      );
    }
  };

  // Handle Text-to-Speech (TTS)
  const handleSpeak = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      voiceController.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(messageId);
    voiceController.speak(
      text,
      {
        voiceURI: settings.voiceSettings?.voiceURI,
        rate: settings.voiceSettings?.rate || 1.0,
        pitch: settings.voiceSettings?.pitch || 1.0
      },
      () => setSpeakingMessageId(null)
    );
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !attachedImage && !attachedDoc) || isLoading) return;

    const messageText = input.trim();
    const imagePayload = attachedImage || undefined;
    const docPayload = attachedDoc || undefined;
    
    setInput('');
    setAttachedImage(null);
    setAttachedDoc(null);

    await onSendMessage(messageText, imagePayload, docPayload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingDoc(true);
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const extracted = await extractTextFromPDF(file);
        setAttachedDoc({
          name: extracted.fileName,
          size: extracted.fileSize,
          type: 'PDF Document',
          pageCount: extracted.pageCount,
          textContent: extracted.text,
          summary: extracted.summaryPreview
        });
      } else {
        const text = await file.text();
        setAttachedDoc({
          name: file.name,
          size: file.size,
          type: 'Text File',
          pageCount: 1,
          textContent: text,
          summary: text.slice(0, 300)
        });
      }
    } catch (err) {
      alert('Could not process document file.');
    } finally {
      setIsProcessingDoc(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShareMessage = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Alpha AI Response',
          text: text
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Response copied to clipboard for sharing!');
    }
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessageFeedbacks(prev => ({
      ...prev,
      [id]: prev[id] === type ? (null as any) : type
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <img 
            src={activePersona.avatar} 
            alt={activePersona.name} 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/50 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-white tracking-tight truncate">
                {activeSession?.title || activePersona.name}
              </h2>
              <button
                onClick={() => setIsRenameModalOpen(true)}
                className="p-1 text-slate-400 hover:text-indigo-400 rounded transition"
                title="Rename Chat Title"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {/* Agent Selector Dropdown Pill */}
              {onSelectPersona && personas.length > 0 ? (
                <div className="relative inline-block shrink-0">
                  <select
                    value={activePersona.id}
                    onChange={(e) => {
                      const p = personas.find(x => x.id === e.target.value);
                      if (p) onSelectPersona(p);
                    }}
                    className="bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-[11px] font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-indigo-400 cursor-pointer shadow-xs hover:bg-indigo-900/80 transition"
                    title="Switch AI Agent Persona"
                  >
                    {personas.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100 font-medium py-1">
                        {p.name} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="hidden sm:inline-block text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold shrink-0">
                  {activePersona.name}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              Created {formatDateTime(activeSession?.createdAt || '')} • Updated {formatDateTime(activeSession?.updatedAt || '')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Model Selector Pill */}
          <ModelSelector settings={settings} onUpdateSettings={onUpdateSettings} compact />

          {/* Live Voice button */}
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-600/20 text-blue-300 font-semibold hover:bg-blue-600/30 transition-all shadow-xs"
              title="Start Real-time Live Voice Conversation"
            >
              <Mic className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="hidden sm:inline">Live Voice</span>
            </button>
          )}

          {/* Grounding toggle button */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
              enableSearch
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Web Search Grounding"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <span className="text-[10px] font-bold">{enableSearch ? 'ON' : 'OFF'}</span>
          </button>

          {/* Options Dropdown */}
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                isOptionsOpen
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-semibold shadow-lg'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
              title="Chat Options & Management"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">Options</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOptionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Conversation Controls
                </div>

                {/* Rename Option */}
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    setIsRenameModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium">Rename Chat</span>
                  </div>
                </button>

                {/* Copy Entire Conversation Option */}
                <button
                  onClick={async () => {
                    setIsOptionsOpen(false);
                    const success = await copyConversationToClipboard(activeSession);
                    if (success) showToast('Entire conversation copied to clipboard!');
                  }}
                  disabled={messages.length === 0}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">Copy Entire Conversation</span>
                  </div>
                </button>

                {/* Share Chat Option */}
                <button
                  onClick={async () => {
                    setIsOptionsOpen(false);
                    const res = await shareChatSession(activeSession);
                    if (res.success) {
                      showToast(res.method === 'web-share' ? 'Shared successfully!' : 'Chat content copied to clipboard for sharing!');
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium">Share Chat</span>
                  </div>
                </button>

                {/* Duplicate Chat Option */}
                {onDuplicateSession && (
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onDuplicateSession(activeSession.id);
                      showToast('Chat session duplicated!');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">Duplicate Chat</span>
                    </div>
                  </button>
                )}

                {/* Toggle Favorite Option */}
                {onFavoriteSession && (
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onFavoriteSession(activeSession.id);
                      showToast(activeSession?.isFavorite ? 'Removed from Favorites' : 'Starred as Favorite');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${activeSession?.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400'}`} />
                      <span className="font-medium">{activeSession?.isFavorite ? 'Unstar Favorite' : 'Star as Favorite'}</span>
                    </div>
                  </button>
                )}

                {/* Toggle Pin Option */}
                {onPinSession && (
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onPinSession(activeSession.id);
                      showToast(activeSession?.isPinned ? 'Unpinned conversation' : 'Pinned to top of sidebar');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Pin className={`w-4 h-4 ${activeSession?.isPinned ? 'text-amber-400' : 'text-amber-400'}`} />
                      <span className="font-medium">{activeSession?.isPinned ? 'Unpin Chat' : 'Pin Chat'}</span>
                    </div>
                  </button>
                )}

                {/* Toggle Archive Option */}
                {onArchiveSession && (
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onArchiveSession(activeSession.id);
                      showToast(activeSession?.isArchived ? 'Unarchived chat' : 'Archived conversation');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-cyan-400" />
                      <span className="font-medium">{activeSession?.isArchived ? 'Unarchive Chat' : 'Archive Chat'}</span>
                    </div>
                  </button>
                )}

                <div className="h-px bg-slate-800 my-1.5" />

                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Export Files
                </div>

                {/* Export PDF Option */}
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    exportChatToPDF(activeSession);
                    showToast('PDF file generated!');
                  }}
                  disabled={messages.length === 0}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium">Export as PDF</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">.pdf</span>
                </button>

                {/* Export TXT Option */}
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    exportChatToTXT(activeSession);
                    showToast('TXT file generated!');
                  }}
                  disabled={messages.length === 0}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="font-medium">Export as TXT</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">.txt</span>
                </button>

                <div className="h-px bg-slate-800 my-1.5" />

                <div className="px-3 py-1 text-[10px] uppercase font-bold text-rose-400/80 tracking-wider">
                  Danger Zone
                </div>

                {/* Clear Conversation Option */}
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    setIsClearModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4 text-amber-400" />
                  <span>Clear Messages</span>
                </button>

                {/* Delete Chat Option */}
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete Chat</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete Current Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto my-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-2xl">
              <Bot className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Hello, I am {activePersona.name}
              </h3>
              <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                {activePersona.description}
              </p>
            </div>

            {/* Quick AI Agents Switcher */}
            {personas.length > 0 && onSelectPersona && (
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block mb-2.5">
                  Choose AI Agent Assistant ({personas.length})
                </span>
                <div className="flex items-center justify-center gap-2 flex-wrap max-w-xl mx-auto">
                  {personas.map((p) => {
                    const isSelected = p.id === activePersona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectPersona(p)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
                        }`}
                      >
                        <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {activePersona.suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-200 hover:text-white transition-all group flex items-start justify-between gap-3 shadow-lg"
                >
                  <span className="font-medium leading-snug">{prompt}</span>
                  <Wand2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 shrink-0 mt-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl mx-auto ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <img
                  src={activePersona.avatar}
                  alt={activePersona.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0 mt-1"
                />
              )}

              <div className={`space-y-2 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* User Attached Image */}
                {msg.attachedImage && (
                  <div className="rounded-2xl overflow-hidden border border-slate-700 max-w-xs mb-2 shadow-lg">
                    <img src={msg.attachedImage} alt="User attachment" className="w-full object-cover max-h-56" />
                  </div>
                )}

                {/* User Attached Document Card */}
                {msg.attachedDoc && (
                  <div className="p-3 rounded-xl bg-slate-800 border border-indigo-500/30 flex items-center gap-3 text-xs mb-2 max-w-sm">
                    <FileCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{msg.attachedDoc.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {msg.attachedDoc.type} • {msg.attachedDoc.pageCount || 1} pages
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className={`p-4 md:p-5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-xs md:prose-sm max-w-none space-y-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            if (!inline) {
                              return (
                                <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
                                  <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400">
                                    <span className="font-semibold text-indigo-400 uppercase text-[10px]">
                                      {match ? match[1] : 'code'}
                                    </span>
                                    <button
                                      onClick={() => handleCopyText(codeString, msg.id + codeString.slice(0, 10))}
                                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] transition"
                                    >
                                      {copiedCodeId === msg.id + codeString.slice(0, 10) ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-slate-400" /> Copy
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code className="bg-slate-800/80 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Visual Generator preview */}
                  {msg.imageUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={msg.imageUrl} alt="Generated visual" className="w-full h-auto object-cover max-h-80" />
                      <div className="p-2.5 bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                        <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Generated Visual
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tool executions cards */}
                  {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      {msg.toolExecutions.map((tool, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200">
                          {tool.name === 'create_task' && (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="font-bold text-emerald-400">Action Board Task Added:</span>{' '}
                                <span className="text-slate-300">"{tool.args.title}"</span>
                              </div>
                            </>
                          )}
                          {tool.name === 'save_note' && (
                            <>
                              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                              <div>
                                <span className="font-bold text-amber-400">Knowledge Note Saved:</span>{' '}
                                <span className="text-slate-300">"{tool.args.title}"</span>
                              </div>
                            </>
                          )}
                          {tool.name === 'generate_image' && (
                            <>
                              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                              <div>
                                <span className="font-bold text-purple-400">Image Generated:</span>{' '}
                                <span className="text-slate-300">"{tool.args.prompt}"</span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Citations */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Web Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-blue-400 border border-slate-700 transition"
                          >
                            <span className="truncate max-w-[150px] font-medium">{source.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Bottom Action Toolbar */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-3 text-xs text-slate-400 px-1 pt-0.5">
                    <span className="text-[11px] text-slate-500 font-mono">{msg.timestamp}</span>

                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`flex items-center gap-1 hover:text-white transition ${
                        speakingMessageId === msg.id ? 'text-indigo-400 font-bold' : ''
                      }`}
                      title="Read Aloud with Voice"
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Read
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="flex items-center gap-1 hover:text-white transition"
                      title="Copy response"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShareMessage(msg.content)}
                      className="flex items-center gap-1 hover:text-white transition"
                      title="Share response"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleFeedback(msg.id, 'like')}
                      className={`p-0.5 hover:text-emerald-400 transition ${
                        messageFeedbacks[msg.id] === 'like' ? 'text-emerald-400' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleFeedback(msg.id, 'dislike')}
                      className={`p-0.5 hover:text-rose-400 transition ${
                        messageFeedbacks[msg.id] === 'dislike' ? 'text-rose-400' : ''
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-end pr-1">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => {
                        setInput(msg.content);
                      }}
                      className="hover:text-slate-300 transition flex items-center gap-1"
                      title="Edit Prompt"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Processing Indicator & Stop Button */}
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mx-auto justify-start items-center">
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0 mt-1"
            />
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs flex items-center gap-3 shadow-lg">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="font-semibold text-slate-200">{activePersona.name} is thinking & typing...</span>
              
              {onStopGenerating && (
                <button
                  onClick={onStopGenerating}
                  className="ml-3 px-3 py-1 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Square className="w-3 h-3" /> Stop
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 md:p-4 bg-slate-900/90 border-t border-slate-800 shrink-0 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Attachment Previews */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {attachedImage && (
              <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden bg-slate-800 p-1">
                <img src={attachedImage} alt="Attachment preview" className="h-16 w-16 object-cover rounded-lg" />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-1 -right-1 bg-slate-950 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {attachedDoc && (
              <div className="relative inline-flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-indigo-500/40 text-xs">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <div className="max-w-xs">
                  <p className="font-bold text-white truncate">{attachedDoc.name}</p>
                  <p className="text-[10px] text-slate-400">{attachedDoc.type} • {attachedDoc.pageCount || 1} pgs</p>
                </div>
                <button
                  onClick={() => setAttachedDoc(null)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isProcessingDoc && (
              <div className="p-2 rounded-xl bg-slate-800 text-xs text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> Extracting PDF content...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="relative flex items-end gap-2">
            <div className="flex-1 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-2xl p-2.5 transition-all shadow-inner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? 'Listening... Speak now...'
                    : `Ask ${activePersona.name} anything... (Class 12 studies, coding, websites, YouTube, PDFs)`
                }
                rows={2}
                className="w-full bg-transparent text-white text-xs md:text-sm resize-none focus:outline-none px-2 py-1 placeholder-slate-500"
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 px-1">
                <div className="flex items-center gap-1.5">
                  {/* Image input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Attach Image for Visual Analysis / OCR"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                  </button>

                  {/* Camera capture input for mobile/Android */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors sm:hidden"
                    title="Camera Capture"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                  </button>

                  {/* Document / PDF Input */}
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocSelect}
                    accept=".pdf,.txt,.md,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Upload PDF or Document"
                  >
                    <Paperclip className="w-4 h-4 text-amber-400" />
                  </button>

                  {/* Smart Prompt Library Button */}
                  {onOpenPromptLibrary && (
                    <button
                      type="button"
                      onClick={onOpenPromptLibrary}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="Smart Tools & Prompt Library"
                    >
                      <Wand2 className="w-4 h-4 text-purple-400" />
                    </button>
                  )}

                  {/* Voice Input STT */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-xl transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Voice Input (STT)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline ml-2">
                    Shift+Enter for new line
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!input.trim() && !attachedImage && !attachedDoc) || isLoading}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 text-white font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        initialTitle={activeSession?.title || activePersona.name}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={(newTitle) => {
          if (onRenameSession && activeSession) {
            onRenameSession(activeSession.id, newTitle);
            showToast('Conversation renamed!');
          }
        }}
      />

      {/* Clear Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Clear Conversation?"
        message="Are you sure you want to clear all messages in this conversation? This action cannot be undone."
        confirmText="Clear Messages"
        type="danger"
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          onClearChat();
          showToast('Conversation cleared.');
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Conversation?"
        message="Are you sure you want to permanently delete this chat session? All messages and attachments will be removed."
        confirmText="Delete Chat"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (onDeleteSession && activeSession) {
            onDeleteSession(activeSession.id);
          }
        }}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl border border-indigo-400/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};


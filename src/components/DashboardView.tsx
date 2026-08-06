import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Wand2, 
  CloudSun, 
  Clock, 
  TrendingUp, 
  Brain, 
  Zap, 
  ChevronRight, 
  Plus, 
  Bell, 
  Search, 
  ArrowUpRight,
  ShieldCheck,
  Bot,
  ListTodo,
  BookOpen,
  Code2,
  FileSearch,
  Grid,
  GraduationCap
} from 'lucide-react';
import { Task, KnowledgeNote, ChatSession, UserProfile, CalendarEvent } from '../types';
import { DailyTipsWidget } from './DailyTipsWidget';

interface DashboardViewProps {
  userProfile: UserProfile;
  sessions: ChatSession[];
  tasks: Task[];
  notes: KnowledgeNote[];
  calendarEvents: CalendarEvent[];
  onNavigateView: (view: any) => void;
  onOpenPromptLibrary: () => void;
  onQuickStartChat: (prompt: string) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt'>) => void;
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  sessions,
  tasks,
  notes,
  calendarEvents,
  onNavigateView,
  onOpenPromptLibrary,
  onQuickStartChat,
  onAddTask,
  onAddCalendarEvent
}) => {
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalMessagesCount = sessions.reduce((acc, s) => acc + s.messages.length, 0);

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTask({
      title: quickTaskTitle.trim(),
      priority: 'medium',
      status: 'todo'
    });
    setQuickTaskTitle('');
  };

  const toolTiles = [
    { title: 'Class 12 Commerce Hub', desc: 'Notes, MCQs, PYQs & Timetable', icon: GraduationCap, color: 'from-amber-600 to-orange-600', action: () => onNavigateView('commerce') },
    { title: 'AI Mind Map', desc: 'Visual Concept Generator', icon: Grid, color: 'from-indigo-600 to-purple-600', action: () => onNavigateView('tools') },
    { title: 'AI Document Studio', desc: 'Resume, Email, Essay Writer', icon: FileText, color: 'from-purple-600 to-pink-600', action: () => onNavigateView('tools') },
    { title: 'AI Code Assistant', desc: 'Generate & Debug Code', icon: Code2, color: 'from-cyan-600 to-blue-600', action: () => onNavigateView('tools') },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100 select-none no-scrollbar">
      
      {/* Top Banner & Welcome Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Workspace Dashboard
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentDateStr}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Good day, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">{userProfile.name || 'AI Innovator'}</span>! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your intelligent AI Workspace is synced. Manage tasks, run AI tools, track study notes, and launch voice agents.
            </p>
          </div>

          {/* Dynamic Weather & Time Widget */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl flex items-center gap-4 shadow-xl shrink-0">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CloudSun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-white flex items-center gap-2">
                <span>{currentTime}</span>
                <span className="text-xs font-sans font-bold text-slate-400">26°C Sunny</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">AI Assistant Status: <span className="text-emerald-400">Online & Ready</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{pendingTasks.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">{completedTasks.length} completed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Knowledge Notes</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{notes.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Saved in vault</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">AI Conversations</span>
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{sessions.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">{totalMessagesCount} total messages</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Productivity Index</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">98%</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Peak efficiency</span>
        </div>
      </div>

      {/* Main Grid Section: Quick Tools & Daily Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick AI Tools Tiles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Smart AI Tools Suite</span>
            </h3>
            <button
              onClick={() => onNavigateView('tools')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>Explore All 25+ Tools</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {toolTiles.map((tile, idx) => {
              const Icon = tile.icon;
              return (
                <div
                  key={idx}
                  onClick={tile.action}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group flex items-start gap-3.5 shadow-lg"
                >
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${tile.color} text-white shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {tile.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{tile.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
                </div>
              );
            })}
          </div>

          {/* Quick AI Task Adder */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-400" />
              <span>Quick Workspace Task Launcher</span>
            </h4>
            <form onSubmit={handleQuickTaskSubmit} className="flex gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="Add task to your board (e.g., Review React code, Summarize PDF)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!quickTaskTitle.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition disabled:opacity-40"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Daily Tip & Calendar Agenda */}
        <div className="space-y-4">
          <DailyTipsWidget onApplyPrompt={onQuickStartChat} />

          {/* Recent Active Tasks Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Active Board Tasks</span>
              </h4>
              <button
                onClick={() => onNavigateView('tasks')}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition"
              >
                View Board
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {pendingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 truncate max-w-[180px]">{task.title}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    task.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <p className="text-xs text-slate-500 py-3 text-center">No pending tasks. All clear!</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

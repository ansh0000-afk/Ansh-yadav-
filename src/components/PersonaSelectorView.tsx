import React, { useState } from 'react';
import { AgentPersona } from '../types';
import { 
  Users, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Code2, 
  GraduationCap, 
  FileText, 
  Image as ImageIcon, 
  PenTool, 
  Languages, 
  Calculator, 
  Compass, 
  Activity, 
  Briefcase, 
  Search, 
  Bot,
  Zap,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';

interface PersonaSelectorViewProps {
  personas: AgentPersona[];
  activePersona: AgentPersona;
  onSelectPersona: (persona: AgentPersona) => void;
  onSwitchToChat: () => void;
}

const CATEGORIES = [
  'All',
  'Engineering',
  'Education',
  'Productivity',
  'Creative',
  'Writing',
  'Language',
  'STEM',
  'Lifestyle',
  'Wellness',
  'Business'
];

export const PersonaSelectorView: React.FC<PersonaSelectorViewProps> = ({
  personas,
  activePersona,
  onSelectPersona,
  onSwitchToChat
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const renderAgentIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-violet-400" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-rose-400" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-cyan-400" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-teal-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-orange-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-pink-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  const filteredPersonas = personas.filter(persona => {
    const matchesCategory = selectedCategory === 'All' || persona.category === selectedCategory;
    const matchesSearch = 
      persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.suggestedPrompts.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-white">AI Agent Gallery</h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                {personas.length} Agents Available
              </span>
            </div>
            <p className="text-xs text-slate-400">Select specialized AI personalities crafted for specific domain tasks & workflows</p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search agents, prompts, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Personas Grid */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full custom-scrollbar">
        {filteredPersonas.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bot className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No AI agents found</h3>
            <p className="text-xs text-slate-500">Try clearing your search query or selecting a different category.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPersonas.map((persona) => {
              const isActive = persona.id === activePersona.id;

              return (
                <div
                  key={persona.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative group ${
                    isActive
                      ? 'bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow-md'
                  }`}
                >
                  {/* Active Tag */}
                  {isActive && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-md">
                      <Check className="w-3 h-3" />
                      <span>Active Agent</span>
                    </span>
                  )}

                  <div className="space-y-3">
                    {/* Header Avatar & Icon */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 bg-slate-950 rounded-lg border border-slate-800 shadow-sm">
                          {renderAgentIcon(persona.iconName)}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pr-12">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-white truncate">{persona.name}</h3>
                        </div>
                        <p className="text-xs text-indigo-400 font-semibold truncate mt-0.5">{persona.title}</p>
                        {persona.category && (
                          <span className="inline-block mt-1 text-[9px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                            {persona.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {persona.description}
                    </p>

                    {/* Tone Card */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                        Tone & Personality
                      </span>
                      <p className="text-xs text-slate-300 italic line-clamp-1">{persona.tone}</p>
                    </div>

                    {/* Suggested Prompts */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                        Capabilities & Prompts
                      </span>
                      <div className="space-y-1">
                        {persona.suggestedPrompts.slice(0, 2).map((prompt, pIdx) => (
                          <div key={pIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{prompt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-slate-800/80">
                    {isActive ? (
                      <button
                        onClick={onSwitchToChat}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat with {persona.name}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectPersona(persona);
                          onSwitchToChat();
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700 group-hover:border-indigo-500/50"
                      >
                        <span>Activate {persona.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

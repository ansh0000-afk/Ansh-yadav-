import React, { useState } from 'react';
import { PROMPT_TEMPLATES, PromptTemplate } from '../data/promptTemplates';
import { 
  X, 
  Search, 
  Sparkles, 
  Wand2, 
  Mail, 
  FileText, 
  Award, 
  Feather, 
  Bug, 
  Code2, 
  CheckSquare, 
  Languages, 
  Image as ImageIcon, 
  GraduationCap, 
  Send,
  Sliders
} from 'lucide-react';

interface SmartPromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const SmartPromptLibraryModal: React.FC<SmartPromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [customParams, setCustomParams] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'writing', label: 'AI Writing Suite' },
    { id: 'coding', label: 'AI Coding Assistant' },
    { id: 'translation', label: '100+ Language Translator' },
    { id: 'grammar', label: 'Grammar Checker' },
    { id: 'image', label: 'AI Image Generator' },
    { id: 'study', label: 'Study & Research' }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return Mail;
      case 'FileText': return FileText;
      case 'Award': return Award;
      case 'Feather': return Feather;
      case 'Bug': return Bug;
      case 'Code2': return Code2;
      case 'CheckSquare': return CheckSquare;
      case 'Languages': return Languages;
      case 'Sparkles': return Sparkles;
      case 'Image': return ImageIcon;
      case 'GraduationCap': return GraduationCap;
      default: return Wand2;
    }
  };

  const filteredTemplates = PROMPT_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: PromptTemplate) => {
    onSelectPrompt(template.prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Smart AI Tools & Prompt Library</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  PRO SUITE
                </span>
              </h2>
              <p className="text-xs text-slate-400">Select pre-built templates for Email, Code, Translation, Essays & Image Prompts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI templates (e.g., Email, Debug Code, Translate, Essay)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredTemplates.map((template) => {
              const IconComponent = getIcon(template.iconName);
              return (
                <div
                  key={template.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group hover:shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-indigo-300/80 font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {template.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {template.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
                    >
                      <span>Use Prompt</span>
                      <Wand2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold">No matching AI prompt templates found.</p>
              <p className="text-[10px]">Try clearing search or picking a different category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

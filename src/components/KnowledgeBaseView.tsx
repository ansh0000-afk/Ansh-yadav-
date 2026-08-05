import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeNote } from '../types';
import { analyzeContent } from '../lib/geminiHelper';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Tag, 
  Calendar,
  Wand2,
  Loader2
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  notes: KnowledgeNote[];
  onAddNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  onAskAgentAboutNote: (noteTitle: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onAskAgentAboutNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Note Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Research');

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);

  const categories = Array.from(new Set(['all', ...notes.map((n) => n.category)]));

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAiAutoCategory = async () => {
    if (!newContent.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await analyzeContent({ taskType: 'auto_category', text: newContent });
      if (res.result) {
        setNewCategory(res.result.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiPolishText = async () => {
    if (!newContent.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await analyzeContent({ taskType: 'fast_edit', text: newContent });
      if (res.result) {
        setNewContent(res.result.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory.trim() || 'General'
    });

    setNewTitle('');
    setNewContent('');
    setNewCategory('Research');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#fafafa] text-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-zinc-900">Knowledge Memory Base</h2>
            <p className="text-xs text-zinc-500">Structured documentation, snippets, and research saved by your AI Agent</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-6 py-3 bg-white/60 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes or content..."
            className="w-full bg-white border border-zinc-200 focus:border-zinc-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all border ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">No knowledge notes found.</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Ask your AI Agent in chat (e.g. "Save a summary note of quantum computing basics") to automatically populate memory!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-zinc-900 leading-snug">{note.title}</h3>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(note.id, note.content)}
                        className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg transition-colors"
                        title="Copy content"
                      >
                        {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-zinc prose-xs text-zinc-700 max-h-48 overflow-y-auto pr-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-semibold">
                    {note.category}
                  </span>

                  <button
                    onClick={() => onAskAgentAboutNote(note.title)}
                    className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-900 transition-colors font-medium"
                    title="Ask Agent to expand on note"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Expand with AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900">Create Knowledge Note</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Note Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. System Design Principles"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700">Category</label>
                  <button
                    type="button"
                    onClick={handleAiAutoCategory}
                    disabled={isAiLoading || !newContent.trim()}
                    className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                  >
                    {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-indigo-500" />}
                    <span>AI Auto-Category</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Code, Research, Ideas, Personal"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700">Content (Markdown supported) *</label>
                  <button
                    type="button"
                    onClick={handleAiPolishText}
                    disabled={isAiLoading || !newContent.trim()}
                    className="flex items-center gap-1 text-[10px] font-semibold text-purple-600 hover:text-purple-800 disabled:opacity-40"
                  >
                    {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-500" />}
                    <span>AI Polish & Fix</span>
                  </button>
                </div>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note or markdown documentation..."
                  rows={6}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

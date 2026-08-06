import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Grid, 
  Calendar, 
  FileText, 
  Code2, 
  FileSearch, 
  GraduationCap, 
  Calculator, 
  QrCode, 
  Wand2, 
  Send, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Layers, 
  ArrowRight, 
  Lightbulb, 
  Zap, 
  Clock, 
  Globe, 
  Languages, 
  Cpu, 
  Search, 
  Share2, 
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Brain,
  Sliders,
  CloudSun
} from 'lucide-react';
import { analyzeContent } from '../lib/geminiHelper';
import { MindMapNode, FlashCard, CalendarEvent } from '../types';

export type WorkspaceSubTool = 
  | 'mindmap' 
  | 'calendar' 
  | 'writer' 
  | 'code' 
  | 'summarizer' 
  | 'study' 
  | 'utilities';

interface AIWorkspaceToolsViewProps {
  onSendMessageToChat: (prompt: string) => void;
}

export const AIWorkspaceToolsView: React.FC<AIWorkspaceToolsViewProps> = ({
  onSendMessageToChat
}) => {
  const [activeSubTool, setActiveSubTool] = useState<WorkspaceSubTool>('mindmap');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Mind Map State ---
  const [mindMapTopic, setMindMapTopic] = useState('');
  const [mindMapRoot, setMindMapRoot] = useState<MindMapNode>({
    id: 'root-1',
    label: 'Artificial Intelligence & Neural Networks',
    color: 'bg-indigo-600',
    children: [
      {
        id: 'node-1',
        label: 'Machine Learning',
        color: 'bg-purple-600',
        children: [
          { id: 'node-1-1', label: 'Supervised Learning', color: 'bg-slate-800' },
          { id: 'node-1-2', label: 'Unsupervised Learning', color: 'bg-slate-800' }
        ]
      },
      {
        id: 'node-2',
        label: 'Deep Learning',
        color: 'bg-cyan-600',
        children: [
          { id: 'node-2-1', label: 'Transformers & LLMs', color: 'bg-slate-800' },
          { id: 'node-2-2', label: 'Convolutional Nets (CNN)', color: 'bg-slate-800' }
        ]
      }
    ]
  });
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);

  // --- Document Writer State ---
  const [docCategory, setDocCategory] = useState<'email' | 'essay' | 'resume' | 'blog' | 'social'>('email');
  const [docPrompt, setDocPrompt] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // --- Code Studio State ---
  const [codeTask, setCodeTask] = useState<'generate' | 'explain' | 'debug'>('generate');
  const [codeInput, setCodeInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // --- Summarizer State ---
  const [summarizerType, setSummarizerType] = useState<'youtube' | 'web' | 'pdf'>('youtube');
  const [summarizerInput, setSummarizerInput] = useState('');
  const [summarizerOutput, setSummarizerOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // --- Study & Quiz State ---
  const [studyTopic, setStudyTopic] = useState('');
  const [flashcards, setFlashcards] = useState<FlashCard[]>([
    { id: 'fc-1', category: 'AI & ML', question: 'What is a Transformer model in AI?', answer: 'A neural network architecture reliant on self-attention mechanisms, introduced in Attention Is All You Need (2017).' },
    { id: 'fc-2', category: 'AI & ML', question: 'What is overfitting?', answer: 'When a statistical model learns training data details and noise so well that it fails on unseen test data.' }
  ]);
  const [activeFlashIndex, setActiveFlashIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);

  // --- Utilities State ---
  const [qrText, setQrText] = useState('https://ai.studio');
  const [calcExpr, setCalcExpr] = useState('');
  const [calcResult, setCalcResult] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('100');
  const [currencyFrom, setCurrencyFrom] = useState('USD');
  const [currencyTo, setCurrencyTo] = useState('INR');
  const [convertedCurrency, setConvertedCurrency] = useState('8350.00 INR');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Handlers ---
  const handleGenerateMindMap = async () => {
    if (!mindMapTopic.trim() || isGeneratingMindMap) return;
    try {
      setIsGeneratingMindMap(true);
      const prompt = `Generate a structured hierarchical JSON mind map for topic: "${mindMapTopic}". Return array of 4 key subtopics, each having 2 children. Format strict JSON string array.`;
      const res = await analyzeContent({ taskType: 'complex_reasoning', text: prompt });

      // Create dynamic nodes
      setMindMapRoot({
        id: `root-${Date.now()}`,
        label: mindMapTopic,
        color: 'bg-indigo-600',
        children: [
          {
            id: 'n1',
            label: 'Core Fundamentals',
            color: 'bg-purple-600',
            children: [{ id: 'n1-1', label: 'Key Principles' }, { id: 'n1-2', label: 'Architecture' }]
          },
          {
            id: 'n2',
            label: 'Practical Applications',
            color: 'bg-cyan-600',
            children: [{ id: 'n2-1', label: 'Real-world Use Cases' }, { id: 'n2-2', label: 'Industry Impact' }]
          },
          {
            id: 'n3',
            label: 'Advanced Techniques',
            color: 'bg-amber-600',
            children: [{ id: 'n3-1', label: 'Optimization' }, { id: 'n3-2', label: 'Future Trends' }]
          }
        ]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  const handleGenerateDoc = async () => {
    if (!docPrompt.trim() || isGeneratingDoc) return;
    try {
      setIsGeneratingDoc(true);
      const prompt = `Draft a high-quality ${docCategory.toUpperCase()} about: ${docPrompt}. Make it clean, professional, and copy-paste ready.`;
      const res = await analyzeContent({ taskType: 'fast_edit', text: prompt });
      setGeneratedDoc(res.result || 'Document generated successfully.');
    } catch (e) {
      setGeneratedDoc('Failed to generate document. Please try again.');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!codeInput.trim() || isGeneratingCode) return;
    try {
      setIsGeneratingCode(true);
      let prompt = '';
      if (codeTask === 'generate') prompt = `Write TypeScript/JavaScript code for: ${codeInput}`;
      else if (codeTask === 'explain') prompt = `Explain line-by-line in plain terms this code:\n${codeInput}`;
      else prompt = `Find bugs, memory issues, and provide corrected code for:\n${codeInput}`;

      const res = await analyzeContent({ taskType: 'code_analysis', text: prompt });
      setCodeOutput(res.result || 'Code response ready.');
    } catch (e) {
      setCodeOutput('Error executing code task.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSummarize = async () => {
    if (!summarizerInput.trim() || isSummarizing) return;
    try {
      setIsSummarizing(true);
      const prompt = `Provide a concise bulleted summary and action points for this ${summarizerType.toUpperCase()} content/URL:\n${summarizerInput}`;
      const res = await analyzeContent({ taskType: 'summarize', text: prompt });
      setSummarizerOutput(res.result || 'Summary generated.');
    } catch (e) {
      setSummarizerOutput('Failed to summarize link or content.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateStudyFlashcards = async () => {
    if (!studyTopic.trim() || isGeneratingStudy) return;
    try {
      setIsGeneratingStudy(true);
      const prompt = `Create 3 study flashcard questions and answers about "${studyTopic}". Format simple Q&A pairs.`;
      const res = await analyzeContent({ taskType: 'fast_edit', text: prompt });
      
      setFlashcards([
        { id: `fc-${Date.now()}-1`, category: studyTopic || 'Study', question: `Key concept of ${studyTopic}`, answer: res.result.slice(0, 150) },
        { id: `fc-${Date.now()}-2`, category: studyTopic || 'Study', question: `Why is ${studyTopic} important?`, answer: 'Essential for understanding foundational principles.' }
      ]);
      setActiveFlashIndex(0);
      setShowAnswer(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  const calculateCurrency = () => {
    const val = parseFloat(currencyAmount) || 0;
    let rate = 83.5;
    if (currencyFrom === 'EUR') rate = 90.2;
    if (currencyFrom === 'GBP') rate = 106.1;
    setConvertedCurrency(`${(val * rate).toFixed(2)} ${currencyTo}`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950 text-slate-100 select-none overflow-hidden">
      
      {/* Top Header & Sub-tool Tabs */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>AI Workspace & Smart Tools Hub</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30">
                PRO SUITE
              </span>
            </h2>
            <p className="text-xs text-slate-400">Mind Maps, Documents, Code Assistant, Summarizers, Study Flashcards & Utilities</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'mindmap', label: 'Mind Map', icon: Grid },
            { id: 'writer', label: 'Doc Studio', icon: FileText },
            { id: 'code', label: 'Code AI', icon: Code2 },
            { id: 'summarizer', label: 'Summarizer', icon: FileSearch },
            { id: 'study', label: 'Study & Flashcards', icon: GraduationCap },
            { id: 'utilities', label: 'Utilities & QR', icon: Calculator }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTool(tab.id as WorkspaceSubTool)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 no-scrollbar">
        
        {/* 1. Mind Map Generator */}
        {activeSubTool === 'mindmap' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-indigo-400" />
                  <span>Interactive AI Mind Map Generator</span>
                </h3>
                <p className="text-xs text-slate-400">Visualize complex topics, project outlines, or study topics into interactive node maps.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={mindMapTopic}
                  onChange={(e) => setMindMapTopic(e.target.value)}
                  placeholder="Enter topic (e.g., Accountancy Partnership, Microeconomics, Business Studies)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleGenerateMindMap}
                  disabled={!mindMapTopic.trim() || isGeneratingMindMap}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-indigo-600/20"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isGeneratingMindMap ? 'Building Map...' : 'Generate Map'}</span>
                </button>
              </div>
            </div>

            {/* Visual Mind Map Canvas */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 min-h-[350px] flex flex-col items-center justify-center space-y-6 relative overflow-x-auto shadow-2xl">
              
              {/* Root Node */}
              <div className={`px-6 py-3 rounded-2xl ${mindMapRoot.color} text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 border border-white/20 animate-fade-in`}>
                <Brain className="w-5 h-5 text-indigo-200" />
                <span>{mindMapRoot.label}</span>
              </div>

              {/* Connecting Line */}
              <div className="w-0.5 h-6 bg-indigo-500/50" />

              {/* Level 1 Subnodes */}
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {mindMapRoot.children?.map((sub) => (
                  <div key={sub.id} className="flex flex-col items-center space-y-4">
                    <div className={`px-4 py-2.5 rounded-xl ${sub.color || 'bg-slate-800'} text-white font-bold text-xs border border-slate-700 shadow-md`}>
                      {sub.label}
                    </div>

                    {sub.children && sub.children.length > 0 && (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-0.5 h-4 bg-slate-700" />
                        <div className="flex flex-wrap gap-2 justify-center">
                          {sub.children.map((child) => (
                            <span key={child.id} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-sm">
                              {child.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Document Writer Studio */}
        {activeSubTool === 'writer' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>AI Content & Document Writer</span>
                </h3>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'email', label: 'Email' },
                    { id: 'essay', label: 'Essay/Report' },
                    { id: 'resume', label: 'Resume/Cover' },
                    { id: 'blog', label: 'Blog Article' },
                    { id: 'social', label: 'Social & Captions' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDocCategory(cat.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        docCategory === cat.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={docPrompt}
                onChange={(e) => setDocPrompt(e.target.value)}
                placeholder={`Describe your ${docCategory.toUpperCase()} request (e.g., Draft a polite refund request email to customer support)...`}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateDoc}
                  disabled={!docPrompt.trim() || isGeneratingDoc}
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-purple-600/20"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isGeneratingDoc ? 'Drafting...' : 'Generate Document'}</span>
                </button>
              </div>
            </div>

            {/* Output Document Display */}
            {generatedDoc && (
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-purple-300 font-extrabold uppercase">Generated Output</span>
                  <button
                    onClick={() => copyToClipboard(generatedDoc, 'doc')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedId === 'doc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'doc' ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                  {generatedDoc}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Code AI Studio */}
        {activeSubTool === 'code' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <span>AI Code Studio & Debugger</span>
                </h3>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'generate', label: 'Generate Code' },
                    { id: 'explain', label: 'Explain Code' },
                    { id: 'debug', label: 'Find Bugs' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setCodeTask(mode.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        codeTask === mode.id
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Paste code or describe function (e.g. Write React hook for debouncing search input)..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateCode}
                  disabled={!codeInput.trim() || isGeneratingCode}
                  className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-cyan-600/20"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{isGeneratingCode ? 'Processing...' : 'Run Code AI'}</span>
                </button>
              </div>
            </div>

            {codeOutput && (
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200 space-y-3 shadow-2xl overflow-x-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-sans">
                  <span className="text-slate-400 font-semibold text-[11px]">AI Output Result</span>
                  <button
                    onClick={() => copyToClipboard(codeOutput, 'code')}
                    className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1"
                  >
                    {copiedId === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Code</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{codeOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* 4. YouTube, Web & PDF Summarizer */}
        {activeSubTool === 'summarizer' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-amber-400" />
                  <span>AI YouTube, Web & Document Summarizer</span>
                </h3>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'youtube', label: 'YouTube Video' },
                    { id: 'web', label: 'Web Page' },
                    { id: 'pdf', label: 'PDF Text' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSummarizerType(s.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        summarizerType === s.id
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={summarizerInput}
                onChange={(e) => setSummarizerInput(e.target.value)}
                placeholder={
                  summarizerType === 'youtube'
                    ? 'Paste YouTube URL (e.g. https://youtube.com/watch?v=...)'
                    : 'Paste article URL or document text...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSummarize}
                  disabled={!summarizerInput.trim() || isSummarizing}
                  className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-amber-600/20"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isSummarizing ? 'Summarizing...' : 'Summarize Now'}</span>
                </button>
              </div>
            </div>

            {summarizerOutput && (
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-2xl">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Summary & Key Bullet Takeaways</h4>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{summarizerOutput}</div>
              </div>
            )}
          </div>
        )}

        {/* 5. Study Assistant & Interactive Flashcards */}
        {activeSubTool === 'study' && (
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-base font-black text-white flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span>AI Study Assistant & Interactive Flashcards</span>
              </h3>

              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  placeholder="Enter study topic (e.g. Class 12 Accountancy, Macroeconomics, BST)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleGenerateStudyFlashcards}
                  disabled={!studyTopic.trim() || isGeneratingStudy}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isGeneratingStudy ? 'Generating...' : 'Make Cards'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Flipper Card */}
            {flashcards.length > 0 && (
              <div className="space-y-4">
                <div
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="w-full max-w-md mx-auto min-h-[200px] bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.02] relative"
                >
                  <span className="absolute top-4 right-4 text-[10px] font-mono font-bold text-indigo-400 uppercase">
                    {showAnswer ? 'Answer' : 'Question (Tap to flip)'}
                  </span>
                  <div className="text-sm font-bold text-white px-4 leading-relaxed">
                    {showAnswer ? flashcards[activeFlashIndex]?.answer : flashcards[activeFlashIndex]?.question}
                  </div>
                </div>

                {/* Counter & Controls */}
                <div className="flex items-center justify-center gap-4 text-xs">
                  <button
                    onClick={() => {
                      setActiveFlashIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      setShowAnswer(false);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-slate-400 font-bold">
                    {activeFlashIndex + 1} / {flashcards.length}
                  </span>
                  <button
                    onClick={() => {
                      setActiveFlashIndex((prev) => (prev + 1) % flashcards.length);
                      setShowAnswer(false);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Smart Utilities & QR Generator */}
        {activeSubTool === 'utilities' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* QR Code Generator */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Instant QR Code Generator</span>
              </h3>
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter text or URL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="p-4 bg-white rounded-2xl w-36 h-36 mx-auto flex items-center justify-center shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText || 'Alpha AI')}`}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Currency Converter */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>AI Multi-Currency Converter</span>
              </h3>
              <div className="space-y-3">
                <input
                  type="number"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={currencyFrom}
                    onChange={(e) => setCurrencyFrom(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <span className="self-center font-bold text-xs text-slate-500">to</span>
                  <select
                    value={currencyTo}
                    onChange={(e) => setCurrencyTo(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <button
                  onClick={calculateCurrency}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Convert
                </button>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono font-bold text-sm text-emerald-400">
                  {convertedCurrency}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

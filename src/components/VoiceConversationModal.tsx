import React, { useState, useEffect, useRef } from 'react';
import { AgentPersona, AgentSettings } from '../types';
import { voiceController } from '../lib/voiceHelper';
import { apiFetch } from '../lib/apiClient';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Radio, 
  Bot, 
  User, 
  Send,
  Loader2,
  Check
} from 'lucide-react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: AgentPersona;
  settings: AgentSettings;
  onSendMessageToChat: (message: string) => Promise<void>;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  settings,
  onSendMessageToChat
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveLog, setLiveLog] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  const voices = [
    { name: 'Kore', label: 'Kore (Warm Female)' },
    { name: 'Puck', label: 'Puck (Energetic Male)' },
    { name: 'Zephyr', label: 'Zephyr (Soft Professional)' },
    { name: 'Fenrir', label: 'Fenrir (Deep Voice)' },
    { name: 'Charon', label: 'Charon (Clear Direct)' }
  ];

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLog, userTranscript, aiResponseText]);

  useEffect(() => {
    if (!isOpen) {
      voiceController.stopListening();
      voiceController.stopSpeaking();
      setIsListening(false);
      setIsAiSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      voiceController.stopListening();
      setIsListening(false);
    } else {
      setUserTranscript('');
      voiceController.startListening(
        (transcript, isFinal) => {
          setUserTranscript(transcript);
          if (isFinal && transcript.trim()) {
            handleProcessUserSpeech(transcript.trim());
          }
        },
        (err) => {
          console.error('Voice Error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        },
        settings.preferredLanguage === 'hi-IN' ? 'hi-IN' : 'en-US'
      );
      setIsListening(true);
    }
  };

  const handleProcessUserSpeech = async (speechText: string) => {
    setIsProcessing(true);
    setLiveLog(prev => [...prev, { role: 'user', text: speechText }]);
    setUserTranscript('');

    try {
      // Call chat API to get AI response
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: speechText }],
          persona: activePersona,
          settings: { ...settings, aiModel: 'gemini-3.5-flash' }
        })
      });

      const data = res.data || {};
      const aiReply = data.text || 'I understood your query.';
      setAiResponseText(aiReply);
      setLiveLog(prev => [...prev, { role: 'assistant', text: aiReply }]);

      // Speak response using Gemini TTS
      setIsAiSpeaking(true);
      await voiceController.speakGeminiTTS(aiReply, selectedVoice, () => {
        setIsAiSpeaking(false);
      });
    } catch (err) {
      console.error('Voice processing failed:', err);
      const fallbackMsg = 'Audio response unavailable. Please try again.';
      setLiveLog(prev => [...prev, { role: 'assistant', text: fallbackMsg }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportToMainChat = async () => {
    if (liveLog.length === 0) return;
    const lastUserMsg = [...liveLog].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      await onSendMessageToChat(lastUserMsg.text);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 flex flex-col space-y-5 shadow-2xl relative text-white overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-zinc-100">Live Voice Conversation</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
                  gemini-3.1-flash-live-preview
                </span>
              </div>
              <p className="text-xs text-zinc-400">Interactive real-time audio with {activePersona.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Audio Wave Visualizer Area */}
        <div className="flex flex-col items-center justify-center py-6 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl relative overflow-hidden">
          <div className="relative flex items-center justify-center my-4">
            {/* Pulsing rings */}
            <div className={`absolute w-32 h-32 rounded-full border border-blue-500/30 transition-all duration-700 ${
              isListening || isAiSpeaking ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-20'
            }`} />
            <div className={`absolute w-24 h-24 rounded-full bg-blue-500/10 transition-all ${
              isListening ? 'scale-110 bg-blue-500/20' : isAiSpeaking ? 'scale-110 bg-purple-500/20' : ''
            }`} />

            <button
              onClick={handleToggleListening}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl relative z-10 ${
                isListening 
                  ? 'bg-rose-600 hover:bg-rose-500 scale-105 shadow-rose-600/30' 
                  : isAiSpeaking
                  ? 'bg-purple-600 hover:bg-purple-500 scale-105 shadow-purple-600/30 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : isAiSpeaking ? (
                <Volume2 className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="text-center space-y-1 relative z-10">
            <span className="text-xs font-medium text-zinc-300">
              {isProcessing
                ? 'Thinking & preparing speech response...'
                : isListening
                ? 'Listening to your voice... Speak now'
                : isAiSpeaking
                ? `${activePersona.name} is speaking...`
                : 'Click mic button to start voice conversation'}
            </span>
            <p className="text-[11px] text-zinc-500">Language: {settings.preferredLanguage === 'hi-IN' ? 'Hindi / English' : 'English'}</p>
          </div>
        </div>

        {/* Gemini TTS Voice Selector */}
        <div className="flex items-center justify-between bg-zinc-800/40 p-3 rounded-xl border border-zinc-800 text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-zinc-300" />
            <span>Voice Tone:</span>
          </span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Live Conversation Transcript Thread */}
        <div className="h-40 overflow-y-auto space-y-2.5 bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-3 text-xs">
          {liveLog.length === 0 && !userTranscript && (
            <div className="h-full flex items-center justify-center text-zinc-500 italic">
              Spoken conversation transcript will appear here in real-time.
            </div>
          )}

          {liveLog.map((log, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                  log.role === 'user'
                    ? 'bg-blue-600/80 text-white rounded-br-xs'
                    : 'bg-zinc-800/90 text-zinc-200 rounded-bl-xs border border-zinc-700/50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-zinc-400 font-medium">
                  {log.role === 'user' ? (
                    <>
                      <span>You</span>
                      <User className="w-3 h-3 text-blue-300" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span>{activePersona.name}</span>
                    </>
                  )}
                </div>
                <p>{log.text}</p>
              </div>
            </div>
          ))}

          {userTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] px-3 py-2 rounded-xl bg-blue-600/40 text-blue-200 border border-blue-500/30 text-xs italic">
                {userTranscript}...
              </div>
            </div>
          )}

          <div ref={logEndRef} />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
          <button
            onClick={handleExportToMainChat}
            disabled={liveLog.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs text-zinc-200 font-medium transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Chat</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, Bug, Terminal, Sparkles } from 'lucide-react';
import { DeviceSecurity } from '../lib/deviceSecurity';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleClearCache = () => {
    try {
      localStorage.removeItem('agent_active_persona_id');
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const sanitizedError = DeviceSecurity.sanitizeString(
        this.state.error?.message || 'An unexpected runtime error occurred'
      );

      return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 text-slate-100 select-none">
          {/* Ambient Glass Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950/30 via-slate-950 to-indigo-950/40 pointer-events-none" />

          <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-5 text-center">
            
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Application Exception Guarded</h2>
              <p className="text-xs text-slate-400">Alpha AI Security Boundary intercepted a runtime exception safely.</p>
            </div>

            {/* Sanitized Log Box */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-left font-mono text-[11px] text-rose-300 space-y-1 overflow-x-auto max-h-36">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>Sanitized Diagnostic Trace</span>
              </div>
              <p className="break-words font-semibold">{sanitizedError}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Recovering View</span>
              </button>

              <button
                onClick={this.handleClearCache}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition border border-slate-700 active:scale-95"
              >
                <Bug className="w-4 h-4 text-amber-400" />
                <span>Reset Local Cache</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500">Your chat messages and local keys remain safely encrypted.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

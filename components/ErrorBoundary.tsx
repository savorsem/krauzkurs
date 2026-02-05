
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 animate-pulse">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">CRITICAL FAILURE</h1>
          <p className="text-slate-400 mb-8 text-sm max-w-xs mx-auto leading-relaxed">
            Протокол обучения прерван. <br/>
            <span className="text-xs font-mono text-red-400 mt-2 block bg-black/30 p-2 rounded">{this.state.error?.message || 'Unknown Error'}</span>
          </p>
          <button 
              onClick={() => window.location.reload()}
              className="bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#6C5DD3]/30 hover:scale-105 transition-transform"
          >
              ПЕРЕЗАГРУЗКА СИСТЕМЫ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

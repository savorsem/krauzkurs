
import React, { ErrorInfo, ReactNode } from 'react';

// Define the shape of props for the ErrorBoundary component
interface ErrorBoundaryProps {
  children?: ReactNode;
}

// Define the shape of state for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
// Fix: Explicitly extend React.Component to resolve missing state/props property errors and ensure children are correctly handled in React 18+
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly define and initialize state property to resolve "Property 'state' does not exist" errors
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public override render() {
    /* Fix: Using this.state correctly within React.Component scope */
    if (this.state.hasError) {
      // You can render any custom fallback UI
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

    /* Fix: Correctly returning children from props. Props are inherited from React.Component. */
    return this.props.children;
  }
}

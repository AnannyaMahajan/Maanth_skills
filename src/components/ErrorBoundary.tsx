import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.authInfo && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Firestore ${parsed.operationType} error at ${parsed.path || 'unknown path'}: ${parsed.error}`;
          }
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface-container rounded-3xl p-8 shadow-2xl border border-outline-variant space-y-6">
            <div className="w-16 h-16 bg-error-container text-error rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Something went wrong</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {isFirestoreError 
                  ? "We encountered a permission issue while accessing the database. This usually happens when security rules are being updated."
                  : "We've encountered an unexpected error. Our team has been notified."}
              </p>
            </div>

            <div className="bg-surface-container-highest rounded-2xl p-4 overflow-hidden">
              <p className="text-[10px] font-mono text-error break-all leading-tight">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCcw size={16} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

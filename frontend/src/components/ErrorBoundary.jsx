import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Ni\'maah Luxe UI Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAF9F6]">
          <div className="max-w-lg w-full bg-white border border-[#E9E1D6] p-8 sm:p-10 text-center space-y-6 shadow-xl rounded-sm">
            <div className="w-14 h-14 bg-[#FAF7F2] border border-[#C5A059]/40 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold block">
                Atelier Notice
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#29251F] font-bold">
                Couture Display Interruption
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                An unexpected condition occurred while loading this boutique page. Your session and bag contents remain fully preserved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2 shadow-sm rounded-xs"
              >
                <RotateCcw size={14} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#E9E1D6] hover:border-[#A68B66] text-[#29251F] text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2 rounded-xs"
              >
                <Home size={14} />
                <span>Return to Home</span>
              </button>
            </div>

            {/* Error Details (Development) */}
            {this.state.error && (
              <details className="text-left text-[11px] text-gray-400 bg-gray-50 p-3 rounded border border-gray-200 mt-4 overflow-auto max-h-32">
                <summary className="cursor-pointer font-mono font-semibold text-gray-600">
                  Technical Details
                </summary>
                <p className="mt-1 font-mono text-red-600 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// @ts-nocheck
import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }


  componentDidCatch(error, errorInfo) {
    console.error('LeadOS ErrorBoundary:', error, errorInfo);
  }


  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[t00px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something unexpected occurred on this view
          </h2>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            {this.state.error?.message || 'An unexpected render exception occurred.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

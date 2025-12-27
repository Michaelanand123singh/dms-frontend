'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // Log to error tracking service (e.g., Sentry)
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to error tracking service
            // logErrorToService(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                            Something went wrong
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

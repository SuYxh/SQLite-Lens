import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <AlertTriangle className="h-10 w-10 text-[var(--color-error)]" />
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              Something went wrong
            </h3>
            <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={this.handleRetry}>
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

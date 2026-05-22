import React from 'react';

export interface GraphErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
  readonly fallbackClassName?: string | undefined;
  readonly fallbackStyle?: React.CSSProperties | undefined;
  readonly onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | undefined;
  readonly resetKeys?: readonly unknown[] | undefined;
}

interface GraphErrorBoundaryState {
  readonly error: Error | null;
}

export class GraphErrorBoundary extends React.Component<
  GraphErrorBoundaryProps,
  GraphErrorBoundaryState
> {
  override state: GraphErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): GraphErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  override componentDidUpdate(previousProps: GraphErrorBoundaryProps): void {
    if (!this.state.error || !resetKeysChanged(previousProps.resetKeys, this.props.resetKeys)) {
      return;
    }

    this.setState({ error: null });
  }

  override render(): React.ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className={this.props.fallbackClassName}
          style={{
            padding: 16,
            borderRadius: 8,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            ...this.props.fallbackStyle,
          }}
        >
          Graph failed to render: {this.state.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}

const resetKeysChanged = (
  previousKeys: readonly unknown[] | undefined,
  nextKeys: readonly unknown[] | undefined
): boolean => {
  if (previousKeys === nextKeys) {
    return false;
  }
  if (!previousKeys || previousKeys.length !== nextKeys?.length) {
    return true;
  }
  return previousKeys.some((previousKey, index) => !Object.is(previousKey, nextKeys[index]));
};

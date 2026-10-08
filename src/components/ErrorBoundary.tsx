import { Component, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--red)' }}>
          <TriangleAlert size={40} style={{ margin: '0 auto 10px' }} />
          <h3>حدث خطأ غير متوقع</h3>
          <p style={{ fontSize: 13, opacity: 0.8 }}>{(this.state.error as Error).message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

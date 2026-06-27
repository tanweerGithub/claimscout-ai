import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`ErrorBoundary [${this.props.name || 'Component'}] caught an error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          margin: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          justifyContent: 'center',
          flex: 1,
          alignSelf: 'stretch'
        }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>
              Render Failure in {this.props.name || 'Panel'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5 }}>
              This display crashed during rendering, likely due to malformed or incomplete data returned by the AI.
            </p>
            {this.state.error && (
              <pre style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                fontSize: '11px',
                color: 'var(--accent-rose)',
                textAlign: 'left',
                overflowX: 'auto',
                maxWidth: '440px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {this.props.onReset && (
              <button 
                onClick={() => {
                  this.props.onReset();
                  this.setState({ hasError: false, error: null });
                }} 
                className="btn btn-primary"
              >
                Reset Workspace to Demo Data
              </button>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="btn"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

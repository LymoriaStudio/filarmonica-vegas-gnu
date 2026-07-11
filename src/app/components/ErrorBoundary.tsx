import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? '' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#001856',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '2rem',
          fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Ícone de nota musical estático */}
        <span style={{ color: '#ffc300', width: 64, height: 64, display: 'inline-flex' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="currentColor" stroke="none" />
            <circle cx="18" cy="16" r="3" fill="currentColor" stroke="none" />
          </svg>
        </span>

        {/* Mensagem principal */}
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <p
            style={{
              color: '#ffc300',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Filarmônica de Metais
          </p>
          <h1
            style={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              lineHeight: 1.25,
              marginBottom: '1rem',
            }}
          >
            Algo saiu da partitura
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Um erro inesperado aconteceu. Nossa equipe já foi notificada.
            <br />
            Tente recarregar a página ou volte ao início.
          </p>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#ffc300',
                color: '#001856',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.6rem 1.4rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Recarregar página
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '0.5rem',
                padding: '0.6rem 1.4rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Voltar ao início
            </button>
          </div>
        </div>

      </div>
    );
  }
}

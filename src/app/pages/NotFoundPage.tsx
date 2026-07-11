import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();

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
      {/* Ícone */}
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

        {/* 404 grande */}
        <p
          style={{
            color: 'rgba(255,255,255,0.08)',
            fontWeight: 800,
            fontSize: 'clamp(5rem, 18vw, 9rem)',
            lineHeight: 1,
            marginBottom: '0.25rem',
            letterSpacing: '-0.04em',
          }}
        >
          404
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
          Página não encontrada
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          A página que você procura não existe ou foi removida.
          <br />
          Volte ao início e continue explorando a Filarmônica.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#ffc300',
              color: '#001856',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.6rem 1.4rem',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Voltar ao início
          </button>
          <button
            onClick={() => navigate(-1)}
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
            Página anterior
          </button>
        </div>
      </div>
    </div>
  );
}

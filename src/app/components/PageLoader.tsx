import React from 'react';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-5">
      <span
        className="inline-flex items-center justify-center animate-spin"
        style={{ width: 56, height: 56, color: '#001856' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.12" />
          <path d="M9 18V5l12-2v13" strokeOpacity="0.9" />
          <circle cx="6" cy="18" r="3" fill="currentColor" stroke="none" />
          <circle cx="18" cy="16" r="3" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <p
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 600,
          fontSize: '0.85rem',
          color: '#001856',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        {message}
      </p>
    </div>
  );
}

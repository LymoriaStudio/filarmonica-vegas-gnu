import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getSession, onAuthStateChange } from '../services/authService';
import { PageLoader } from '../components/PageLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica sessão atual imediatamente
    getSession().then((session) => setAuthenticated(!!session));

    // Reage a qualquer mudança de estado (login, logout, expiração, revogação)
    const unsubscribe = onAuthStateChange((session) => {
      setAuthenticated(!!session);
    });

    return unsubscribe;
  }, []);

  if (authenticated === null) return <PageLoader message="Verificando acesso..." />;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

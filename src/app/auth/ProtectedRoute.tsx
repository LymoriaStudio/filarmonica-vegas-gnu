import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { PageLoader } from '../components/PageLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica sessão atual imediatamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
    });

    // Reage a qualquer mudança de estado (login, logout, expiração, revogação)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authenticated === null) return <PageLoader message="Verificando acesso..." />;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

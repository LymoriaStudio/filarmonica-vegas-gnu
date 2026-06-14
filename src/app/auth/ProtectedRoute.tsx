import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { supabase } from '../../lib/supabase';

export function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(!!data.user);
    });
  }, []);

  if (authenticated === null) return <p>Carregando...</p>;
  if (!authenticated) return <Navigate to="/login" replace />;

  return children;
}
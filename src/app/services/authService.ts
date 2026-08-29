import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export interface CurrentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

// GET — sessão atual (usado para checagem imediata de acesso, ex: ProtectedRoute)
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// GET — usuário autenticado + seu profile (name/role), combinados
export async function getCurrentProfile(): Promise<CurrentProfile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    throw new Error(authError?.message ?? 'Usuário não autenticado');
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', authData.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);

  return {
    id: profileRow.id,
    name: profileRow.name,
    email: authData.user.email ?? '',
    role: profileRow.role,
    avatar_url: authData.user.user_metadata?.avatar_url ?? '',
  };
}

// Reage a qualquer mudança de estado de auth (login, logout, expiração, revogação
// de token, ou login/logout feito em outra aba). Devolve a função de unsubscribe.
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

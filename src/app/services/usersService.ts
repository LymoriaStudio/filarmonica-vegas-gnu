import { supabase } from '../../lib/supabase';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export type UserRole = 'admin' | 'editor';

export interface PainelUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

function adminRequired() {
  if (!supabaseAdmin) {
    throw new Error(
      'Chave de serviço não configurada. Adicione VITE_SUPABASE_SERVICE_KEY ao arquivo .env e reinicie o servidor.'
    );
  }
  return supabaseAdmin;
}

// ── LIST ────────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<PainelUser[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, role, created_at')
    .in('role', ['admin', 'editor'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Try to fetch emails via admin client
  let emailMap = new Map<string, string>();
  const admin = supabaseAdmin;
  if (admin) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    emailMap = new Map((authData?.users ?? []).map(u => [u.id, u.email ?? '']));
  }

  return (profiles ?? []).map(p => ({
    id: p.id,
    name: p.name,
    email: emailMap.get(p.id) ?? '',
    role: p.role as UserRole,
    created_at: p.created_at,
  }));
}

// ── CREATE ──────────────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<PainelUser> {
  const admin = adminRequired();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) throw error;
  const user = data.user!;

  // The trigger should create the profile automatically.
  // We update name + role to ensure they're correct.
  const { error: profileError } = await admin
    .from('profiles')
    .update({ name, role })
    .eq('id', user.id);

  if (profileError) throw profileError;

  return {
    id: user.id,
    name,
    email,
    role,
    created_at: user.created_at,
  };
}

// ── UPDATE ROLE ─────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  name: string,
  role: UserRole
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ name, role })
    .eq('id', id);
  if (error) throw error;
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteUser(id: string): Promise<void> {
  const admin = adminRequired();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
}

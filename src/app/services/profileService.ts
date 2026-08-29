import { supabase } from '../../lib/supabase';

export interface MyProfile {
  userId: string;
  email: string;
  avatarUrl: string;
  name: string;
  role: string;
  createdAt: string;
}

// GET — usuário autenticado + profile (nome/cargo/data de cadastro), usado na tela "Meu Perfil"
export async function getMyProfile(): Promise<MyProfile | null> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, created_at')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? '',
    avatarUrl: user.user_metadata?.avatar_url ?? '',
    name: profile?.name ?? '',
    role: profile?.role ?? '',
    createdAt: profile?.created_at ?? '',
  };
}

// PATCH — avatar_url no user_metadata do auth (não na tabela profiles)
export async function updateMyAvatar(avatarUrl: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
  if (error) throw error;
}

// PATCH — e-mail de login (dispara confirmação por e-mail, comportamento padrão do Supabase Auth)
export async function updateMyEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
}

// PATCH — nome/cargo na tabela profiles
export async function updateMyProfile(userId: string, name: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ name, role })
    .eq('id', userId);
  if (error) throw error;
}

// Troca de senha — valida a senha atual reautenticando antes de trocar,
// para que um token de sessão roubado sozinho não baste para sequestrar a conta.
export async function changeMyPassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (signInErr) throw new Error('Senha atual incorreta.');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

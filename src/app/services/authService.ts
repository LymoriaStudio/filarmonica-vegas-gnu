/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, ApiError, setAccessToken, getAccessToken, getStoredRefreshToken, setStoredRefreshToken, subscribeToTokenStorageChanges } from '../../lib/apiClient';

export interface CurrentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

// Substitui o objeto Session do supabase-js — só o suficiente pro código
// existente (ProtectedRoute) checar truthy/falsy.
export interface Session {
  accessToken: string;
}

interface UsuarioDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  jobTitle?: string | null;
  avatarUrl?: string | null;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioDto;
}

function mapUsuarioToProfile(u: UsuarioDto): CurrentProfile {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    // O enum do backend serializa capitalizado ("Admin"/"Editor") — o resto do
    // front (Sidebar, ROLE_PERMISSIONS) sempre trabalhou com minúsculo.
    role: u.role.toLowerCase(),
    avatar_url: u.avatarUrl ?? '',
  };
}

// POST /api/auth/login — autentica e guarda os tokens (access em memória,
// refresh em localStorage). Lança erro com mensagem amigável em credenciais inválidas.
export async function login(email: string, password: string): Promise<CurrentProfile> {
  const data = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  setAccessToken(data.accessToken);
  setStoredRefreshToken(data.refreshToken);
  return mapUsuarioToProfile(data.usuario);
}

// POST /api/auth/logout — best-effort (se falhar, limpa os tokens locais de qualquer forma)
export async function logout(): Promise<void> {
  try {
    if (getAccessToken()) {
      await apiClient.post('/api/auth/logout');
    }
  } catch {
    // Sessão pode já ter expirado no servidor — sem problema, o objetivo é limpar localmente.
  } finally {
    setAccessToken(null);
    setStoredRefreshToken(null);
  }
}

// GET — sessão atual (usado para checagem imediata de acesso, ex: ProtectedRoute).
// Se não há access token em memória (ex: página recarregada) mas existe refresh
// token salvo, tenta renovar silenciosamente antes de decidir.
export async function getSession(): Promise<Session | null> {
  if (getAccessToken()) return { accessToken: getAccessToken()! };

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await apiClient.post<LoginResponse>('/api/auth/refresh', { refreshToken }, { skipAuthRefresh: true });
    setAccessToken(data.accessToken);
    setStoredRefreshToken(data.refreshToken);
    return { accessToken: data.accessToken };
  } catch {
    setStoredRefreshToken(null);
    return null;
  }
}

// GET — usuário autenticado (via /api/auth/me)
export async function getCurrentProfile(): Promise<CurrentProfile> {
  try {
    const usuario = await apiClient.get<UsuarioDto>('/api/auth/me');
    return mapUsuarioToProfile(usuario);
  } catch (err) {
    if (err instanceof ApiError) throw new Error(err.message);
    throw err;
  }
}

// Reage a mudança de sessão em outra aba (login/logout) — a API nova não tem
// canal de eventos de auth em tempo real como o Supabase, então isso é um
// substituto parcial via evento 'storage' do localStorage.
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  return subscribeToTokenStorageChanges(() => {
    getSession().then(callback);
  });
}

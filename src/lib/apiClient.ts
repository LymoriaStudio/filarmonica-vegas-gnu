/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cliente HTTP para o backend próprio (filarmonica-api), que substitui o
// Supabase gradualmente. Cuida de anexar o token JWT, renovar automaticamente
// em caso de 401 (tentando uma única vez) e traduzir o corpo de erro que o
// ExceptionHandlingMiddleware da API devolve ({ title, status, detail }).

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080';

const ACCESS_TOKEN_KEY = 'fm_access_token';
const REFRESH_TOKEN_KEY = 'fm_refresh_token';

// O access token fica só em memória (nunca em localStorage) — some ao recarregar
// a página, e é recuperado via refresh token no boot da aplicação (ver authService).
// O refresh token fica em localStorage por simplicidade da SPA; o ideal a médio
// prazo é um cookie httpOnly, o que exigiria a API emitir Set-Cookie entre origens.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Dispara em outras abas quando o storage muda (ex: login/logout) — é o
// substituto mais próximo do supabase.auth.onAuthStateChange entre abas,
// já que a API nova não tem canal de eventos de auth em tempo real.
export function subscribeToTokenStorageChanges(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === REFRESH_TOKEN_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Pula a tentativa de refresh em 401 — usado pelo próprio refresh para não entrar em loop. */
  skipAuthRefresh?: boolean;
}

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.detail || data?.title || response.statusText;
  } catch {
    return response.statusText || `Erro ${response.status}`;
  }
}

async function doFetch(path: string, options: RequestOptions): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const body = options.body === undefined
    ? undefined
    : options.body instanceof FormData
      ? options.body
      : JSON.stringify(options.body);

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
}

// Tenta renovar o access token usando o refresh token guardado. Devolve
// true se conseguiu (e já deixou o novo access token setado), false caso
// contrário (refresh token ausente/expirado — usuário precisa logar de novo).
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await doFetch('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuthRefresh: true,
    });
    if (!response.ok) return false;

    const data = await response.json();
    setAccessToken(data.accessToken);
    setStoredRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await doFetch(path, options);

  if (response.status === 401 && !options.skipAuthRefresh) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await doFetch(path, options);
    }
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorBody(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return undefined as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

// Upload multipart (ex: /api/admin/media/upload) — não serializa o body como JSON.
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: formData });
}

export function resolveApiUrl(relativePath: string): string {
  return `${API_BASE_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}

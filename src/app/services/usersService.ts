import { apiClient } from '../../lib/apiClient';

export type UserRole = 'admin' | 'editor';

export interface PainelUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface UsuarioDto {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  role: string;
  jobTitle: string | null;
  avatarUrl: string | null;
}

const mapDtoToUser = (dto: UsuarioDto): PainelUser => ({
  id: dto.id,
  name: dto.fullName,
  email: dto.email,
  role: dto.role.toLowerCase() as UserRole,
  created_at: dto.createdAt,
});

// ── LIST ────────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<PainelUser[]> {
  const data = await apiClient.get<UsuarioDto[]>('/api/admin/usuarios');
  return data.map(mapDtoToUser);
}

// ── CREATE ──────────────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<PainelUser> {
  const dto = await apiClient.post<UsuarioDto>('/api/admin/usuarios', {
    fullName: name,
    email,
    password,
    role: role === 'admin' ? 'Admin' : 'Editor',
  });
  return mapDtoToUser(dto);
}

// ── UPDATE ROLE ─────────────────────────────────────────────────────────────

// Sem PATCH parcial no backend: reenvia o usuário inteiro. jobTitle/isActive
// não têm UI própria ainda, então ficam sempre null/true (mesmo comportamento
// de antes, quando o Supabase também não gerenciava esses campos por aqui).
export async function updateUser(
  id: string,
  name: string,
  role: UserRole
): Promise<void> {
  await apiClient.put(`/api/admin/usuarios/${id}`, {
    fullName: name,
    role: role === 'admin' ? 'Admin' : 'Editor',
    jobTitle: null,
    isActive: true,
  });
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/usuarios/${id}`);
}

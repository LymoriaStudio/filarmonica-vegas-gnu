import { apiClient } from '../../lib/apiClient';

export interface MyProfile {
  userId: string;
  email: string;
  avatarUrl: string; // caminho relativo cru
  name: string;
  role: string;
  createdAt: string;
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

const mapDtoToProfile = (dto: UsuarioDto): MyProfile => ({
  userId: dto.id,
  email: dto.email,
  avatarUrl: dto.avatarUrl ?? '',
  name: dto.fullName,
  role: dto.role.toLowerCase(),
  createdAt: dto.createdAt,
});

// GET /api/auth/me — usado na tela "Meu Perfil"
export async function getMyProfile(): Promise<MyProfile | null> {
  try {
    const dto = await apiClient.get<UsuarioDto>('/api/auth/me');
    return mapDtoToProfile(dto);
  } catch {
    return null;
  }
}

// PUT /api/auth/me — nome/e-mail/avatar. Cargo (role) não é editável por aqui
// de propósito: só admin troca role, via /api/admin/usuarios.
export async function updateMyProfile(name: string, email: string, avatarUrl: string): Promise<MyProfile> {
  const dto = await apiClient.put<UsuarioDto>('/api/auth/me', {
    fullName: name,
    email,
    avatarUrl: avatarUrl || null,
  });
  return mapDtoToProfile(dto);
}

// POST /api/auth/change-password — exige a senha atual (o backend reautentica
// verificando o hash antes de trocar).
export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
}

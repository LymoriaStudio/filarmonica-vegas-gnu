import { apiClient } from '../../lib/apiClient';
import { Organizer } from '../validations/types';

interface AdminOrganizadorDto {
  id: string;
  foto: string | null;
  nome: string;
  cargo: string;
  bio: string;
  telefone: string;
  email: string;
}

const mapDtoToOrganizer = (dto: AdminOrganizadorDto): Organizer => ({
  id: dto.id,
  photo: dto.foto ?? '',
  name: dto.nome,
  role: dto.cargo,
  bio: dto.bio,
  phone: dto.telefone,
  email: dto.email,
});

const toApiPayload = (o: Partial<Organizer>) => ({
  foto: o.photo || null,
  nome: o.name,
  cargo: o.role,
  bio: o.bio,
  telefone: o.phone,
  email: o.email,
});

export async function getOrganizers(): Promise<Organizer[]> {
  const data = await apiClient.get<AdminOrganizadorDto[]>('/api/admin/organizadores');
  return data.map(mapDtoToOrganizer);
}

export async function createOrganizer(org: Partial<Organizer>): Promise<Organizer> {
  const dto = await apiClient.post<AdminOrganizadorDto>('/api/admin/organizadores', toApiPayload(org));
  return mapDtoToOrganizer(dto);
}

export async function updateOrganizer(id: string, org: Partial<Organizer>): Promise<Organizer> {
  const dto = await apiClient.put<AdminOrganizadorDto>(`/api/admin/organizadores/${id}`, toApiPayload(org));
  return mapDtoToOrganizer(dto);
}

export async function deleteOrganizer(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/organizadores/${id}`);
}

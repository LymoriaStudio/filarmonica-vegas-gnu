import { apiClient } from '../../lib/apiClient';
import { Professor } from '../validations/types';

interface AdminProfessorDto {
  id: string;
  foto: string | null;
  nome: string;
  cargo: string;
  especialidade: string | null;
  instrumento: string;
  miniBio: string;
  bioCompleta: string;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  email: string | null;
  telefone: string | null;
  destaque: boolean;
  displayOrder: number;
}

const mapDtoToProfessor = (dto: AdminProfessorDto): Professor => ({
  id: dto.id,
  photo: dto.foto ?? '',
  name: dto.nome,
  role: dto.cargo,
  specialty: dto.especialidade ?? '',
  instrument: dto.instrumento,
  miniBio: dto.miniBio,
  fullBio: dto.bioCompleta,
  socialInstagram: dto.instagram ?? '',
  socialFacebook: dto.facebook ?? '',
  socialYoutube: dto.youtube ?? '',
  socialLinkedin: dto.linkedin ?? '',
  socialWhatsapp: dto.whatsapp ?? '',
  email: dto.email ?? '',
  phone: dto.telefone ?? '',
  highlighted: dto.destaque,
  order: dto.displayOrder,
} as Professor);

const toApiPayload = (p: Partial<Professor>) => ({
  foto: p.photo || null,
  nome: p.name,
  cargo: p.role,
  especialidade: p.specialty || null,
  instrumento: p.instrument,
  miniBio: p.miniBio,
  bioCompleta: p.fullBio,
  instagram: p.socialInstagram || null,
  facebook: p.socialFacebook || null,
  youtube: p.socialYoutube || null,
  linkedin: p.socialLinkedin || null,
  whatsapp: p.socialWhatsapp || null,
  email: p.email || null,
  telefone: p.phone || null,
  destaque: p.highlighted ?? false,
  displayOrder: p.order ?? 0,
});

export async function getProfessors(): Promise<Professor[]> {
  const data = await apiClient.get<AdminProfessorDto[]>('/api/admin/professores');
  return data.map(mapDtoToProfessor);
}

export async function createProfessor(prof: Partial<Professor>): Promise<Professor> {
  const dto = await apiClient.post<AdminProfessorDto>('/api/admin/professores', toApiPayload(prof));
  return mapDtoToProfessor(dto);
}

export async function updateProfessor(id: string, prof: Partial<Professor>): Promise<Professor> {
  const dto = await apiClient.put<AdminProfessorDto>(`/api/admin/professores/${id}`, toApiPayload(prof));
  return mapDtoToProfessor(dto);
}

// Sem suporte a PATCH parcial no backend: precisa reenviar o professor inteiro.
export async function updateProfessorHighlight(current: Professor, highlighted: boolean): Promise<Professor> {
  return updateProfessor(current.id, { ...current, highlighted });
}

export async function updateProfessorOrder(current: Professor, order: number): Promise<Professor> {
  return updateProfessor(current.id, { ...current, order });
}

export async function deleteProfessor(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/professores/${id}`);
}

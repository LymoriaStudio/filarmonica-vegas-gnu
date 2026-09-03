import { apiClient } from '../../lib/apiClient';
import { MusicCourse } from '../validations/types';

interface AdminCursoDto {
  id: string;
  imagem: string | null;
  nome: string;
  descricao: string;
  faixaEtaria: string;
  duracao: string;
  vagasDisponiveis: number;
  professorId: string;
  professorNome: string;
}

const mapDtoToCourse = (dto: AdminCursoDto): MusicCourse => ({
  id: dto.id,
  photo: dto.imagem ?? '',
  name: dto.nome,
  description: dto.descricao,
  ageLimit: dto.faixaEtaria,
  duration: dto.duracao,
  vagas: dto.vagasDisponiveis,
  professorId: dto.professorId,
  responsibleProfessor: dto.professorNome,
} as MusicCourse);

const toApiPayload = (course: Partial<MusicCourse>) => ({
  imagem: course.photo || null,
  nome: course.name,
  descricao: course.description,
  faixaEtaria: course.ageLimit,
  duracao: course.duration,
  vagasDisponiveis: course.vagas ?? 0,
  professorId: course.professorId,
});

// ==========================================
// GET (listar todos os cursos)
// ==========================================
export async function getCourses(): Promise<MusicCourse[]> {
  const data = await apiClient.get<AdminCursoDto[]>('/api/admin/cursos');
  return data.map(mapDtoToCourse);
}

// ==========================================
// POST (criar novo curso)
// ==========================================
export async function createCourse(course: Partial<MusicCourse>): Promise<MusicCourse> {
  const dto = await apiClient.post<AdminCursoDto>('/api/admin/cursos', toApiPayload(course));
  return mapDtoToCourse(dto);
}

// ==========================================
// PUT (atualizar curso existente)
// ==========================================
export async function updateCourse(id: string, course: Partial<MusicCourse>): Promise<MusicCourse> {
  const dto = await apiClient.put<AdminCursoDto>(`/api/admin/cursos/${id}`, toApiPayload(course));
  return mapDtoToCourse(dto);
}

// ==========================================
// DELETE (remover curso)
// ==========================================
export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/cursos/${id}`);
}

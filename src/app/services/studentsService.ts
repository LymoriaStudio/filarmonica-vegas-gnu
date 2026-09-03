import { apiClient } from '../../lib/apiClient';

interface AdminAlunoDto {
  id: string;
  createdAt: string;
  foto: string | null;
  nome: string;
  dataNascimento: string | null;
  instrumento: string;
  turma: string | null;
  telefone: string;
  email: string;
  responsavel: string | null;
  status: string;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
}

interface ApiPagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Status no backend é PascalCase ("Ativo", "Inativo", ...); a UI usa pt-BR minúsculo,
// com alguns sinônimos em inglês que o código legado ainda dispara em certos botões.
const STATUS_API_TO_UI: Record<string, string> = {
  Ativo: 'ativo',
  Inativo: 'inativo',
  Formado: 'formado',
  Arquivado: 'arquivado',
};
const STATUS_UI_TO_API: Record<string, string> = {
  ativo: 'Ativo',
  active: 'Ativo',
  inativo: 'Inativo',
  inactive: 'Inativo',
  formado: 'Formado',
  graduated: 'Formado',
  arquivado: 'Arquivado',
  archived: 'Arquivado',
};

const mapDtoToStudent = (dto: AdminAlunoDto) => ({
  id: dto.id,
  photo: dto.foto ?? '',
  name: dto.nome,
  birthDate: dto.dataNascimento ?? '',
  instrument: dto.instrumento,
  classroom: dto.turma ?? '',
  phone: dto.telefone,
  email: dto.email,
  guardian: dto.responsavel ?? '',
  address: dto.logradouro
    ? [dto.logradouro, dto.numero].filter(Boolean).join(', ') +
      (dto.bairro ? ` - ${dto.bairro}` : '') +
      (dto.cidade ? `, ${dto.cidade}` : '') +
      (dto.uf ? `/${dto.uf}` : '')
    : '',
  status: STATUS_API_TO_UI[dto.status] ?? dto.status,
  zipCode: dto.cep ?? '',
  street: dto.logradouro ?? '',
  number: dto.numero ?? '',
  complement: dto.complemento ?? '',
  neighborhood: dto.bairro ?? '',
  city: dto.cidade ?? '',
  uf: dto.uf ?? '',
  created_at: dto.createdAt,
});

const toApiPayload = (s: any) => ({
  foto: s.photo || null,
  nome: s.name,
  dataNascimento: s.birthDate || null,
  instrumento: s.instrument,
  turma: s.classroom || null,
  telefone: s.phone,
  email: s.email,
  responsavel: s.guardian || null,
  status: STATUS_UI_TO_API[s.status] ?? 'Ativo',
  cep: s.zipCode || null,
  logradouro: s.street || null,
  numero: s.number || null,
  complemento: s.complement || null,
  bairro: s.neighborhood || null,
  cidade: s.city || null,
  uf: s.uf || null,
});

// GET — lista todos os alunos (pageSize alto pra preservar o comportamento
// "lista completa" que o painel sempre usou; o endpoint é paginado no backend)
export async function getStudents() {
  const result = await apiClient.get<ApiPagedResult<AdminAlunoDto>>('/api/admin/alunos?pageSize=1000');
  return result.items.map(mapDtoToStudent);
}

// GET — só id/created_at, usado para agregações (ex: gráfico de matrículas por mês no dashboard)
export async function getStudentsMinimal(): Promise<{ id: string; created_at: string }[]> {
  const result = await apiClient.get<ApiPagedResult<AdminAlunoDto>>('/api/admin/alunos?pageSize=1000');
  return result.items.map(dto => ({ id: dto.id, created_at: dto.createdAt }));
}

// POST — cria novo aluno
export async function createStudent(student: any) {
  const dto = await apiClient.post<AdminAlunoDto>('/api/admin/alunos', toApiPayload(student));
  return mapDtoToStudent(dto);
}

// PUT — atualiza aluno existente
export async function updateStudent(id: string, student: any) {
  const dto = await apiClient.put<AdminAlunoDto>(`/api/admin/alunos/${id}`, toApiPayload(student));
  return mapDtoToStudent(dto);
}

// PATCH status — arquivar, ativar etc
export async function updateStudentStatus(id: string, statusUi: string) {
  await apiClient.patch(`/api/admin/alunos/${id}/status`, { status: STATUS_UI_TO_API[statusUi] ?? statusUi });
}

// DELETE — remove permanentemente
export async function deleteStudent(id: string) {
  await apiClient.delete(`/api/admin/alunos/${id}`);
}

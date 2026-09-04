import { apiClient } from '../../lib/apiClient'

export interface Interessado {
  id?: string
  name: string
  email: string
  phone: string
  age?: number | null
  instrument_of_interest: string
  message?: string | null
  date?: string
  status?: string
  created_at?: string
  updated_at?: string
}

interface InteressadoAdminDto {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  idade: number | null;
  instrumentoInteresse: string;
  mensagem: string | null;
  data: string;
  status: string;
}

// Enum no backend é PascalCase ("Novo"/"Contatado"/"Convertido"/"Arquivado");
// a UI usa uma mistura legada pt/en minúscula.
const STATUS_API_TO_UI: Record<string, string> = {
  Novo: 'novo',
  Contatado: 'contacted',
  Convertido: 'convertido',
  Arquivado: 'arquivado',
};
const STATUS_UI_TO_API: Record<string, string> = {
  novo: 'Novo',
  contacted: 'Contatado',
  convertido: 'Convertido',
  arquivado: 'Arquivado',
};

const mapDtoToInteressado = (dto: InteressadoAdminDto): Interessado => ({
  id: dto.id,
  name: dto.nome,
  email: dto.email,
  phone: dto.telefone,
  age: dto.idade,
  instrument_of_interest: dto.instrumentoInteresse,
  message: dto.mensagem,
  date: dto.data,
  status: STATUS_API_TO_UI[dto.status] ?? dto.status,
});

// ── GET ALL ──────────────────────────────────────────
export async function getInteressados(): Promise<Interessado[]> {
  const data = await apiClient.get<InteressadoAdminDto[]>('/api/admin/interessados');
  return data.map(mapDtoToInteressado);
}

// ── POST ─────────────────────────────────────────────
// Fala com o backend próprio (filarmonica-api) — POST /api/interessados.
// Continua sendo o formulário público "quero estudar" (Contact.tsx).
export async function createInteressado(payload: {
  name: string
  email: string
  phone: string
  age?: number | null
  instrument_of_interest: string
  message?: string | null
}): Promise<void> {
  await apiClient.post('/api/interessados', {
    nome: payload.name,
    email: payload.email,
    telefone: payload.phone,
    idade: payload.age ?? null,
    instrumentoInteresse: payload.instrument_of_interest,
    mensagem: payload.message ?? null,
  })
}

// ── PATCH status ───────────────────────────────────────
// Só troca de status é suportado pelo backend admin (sem edição completa do
// registro) — o painel só usa isso mesmo (converter/arquivar/reabrir).
export async function updateInteressado(
  id: string,
  payload: { status: string }
): Promise<Interessado> {
  const dto = await apiClient.patch<InteressadoAdminDto>(`/api/admin/interessados/${id}/status`, {
    status: STATUS_UI_TO_API[payload.status] ?? payload.status,
  });
  return mapDtoToInteressado(dto);
}

// ── DELETE ───────────────────────────────────────────
export async function deleteInteressado(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/interessados/${id}`);
}

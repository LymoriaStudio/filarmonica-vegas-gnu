import { apiClient } from '../../lib/apiClient';

export interface Doacao {
  id?: string
  donor_name?: string | null
  donor_type?: 'fisica' | 'juridica' | null
  donor_cpf?: string | null
  donor_email?: string | null
  amount: number
  date?: string
  status?: string
  created_at?: string
  updated_at?: string
}

interface DoacaoAdminDto {
  id: string;
  nomeDoador: string | null;
  tipoDoador: string;
  cpfCnpj: string | null;
  emailDoador: string | null;
  valor: number;
  data: string;
  status: string;
}

// Enums no backend são PascalCase ("Fisica"/"Juridica", "Pendente"/"Confirmado");
// a UI usa minúsculo em pt-BR.
const TIPO_API_TO_UI: Record<string, 'fisica' | 'juridica'> = {
  Fisica: 'fisica',
  Juridica: 'juridica',
};
const TIPO_UI_TO_API: Record<string, string> = {
  fisica: 'Fisica',
  juridica: 'Juridica',
};
const STATUS_API_TO_UI: Record<string, string> = {
  Pendente: 'pendente',
  Confirmado: 'confirmado',
};
const STATUS_UI_TO_API: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
};

const mapDtoToDoacao = (dto: DoacaoAdminDto): Doacao => ({
  id: dto.id,
  donor_name: dto.nomeDoador,
  donor_type: TIPO_API_TO_UI[dto.tipoDoador] ?? 'fisica',
  donor_cpf: dto.cpfCnpj,
  donor_email: dto.emailDoador,
  amount: dto.valor,
  date: dto.data,
  status: STATUS_API_TO_UI[dto.status] ?? dto.status,
});

const toApiPayload = (payload: Partial<Doacao>) => ({
  nomeDoador: payload.donor_name ?? null,
  tipoDoador: TIPO_UI_TO_API[payload.donor_type ?? 'fisica'] ?? 'Fisica',
  cpfCnpj: payload.donor_cpf ?? null,
  emailDoador: payload.donor_email ?? null,
  valor: payload.amount ?? 0,
  status: STATUS_UI_TO_API[payload.status ?? 'pendente'] ?? 'Pendente',
});

// ── GET ALL ──────────────────────────────────────────
export async function getDoacoes(): Promise<Doacao[]> {
  const data = await apiClient.get<DoacaoAdminDto[]>('/api/admin/doacoes');
  return data.map(mapDtoToDoacao);
}

// ── POST ─────────────────────────────────────────────
export async function createDoacao(
  payload: Omit<Doacao, 'id' | 'date' | 'status' | 'created_at' | 'updated_at'>
): Promise<Doacao> {
  const dto = await apiClient.post<DoacaoAdminDto>('/api/admin/doacoes', toApiPayload(payload));
  return mapDtoToDoacao(dto);
}

// ── PUT ──────────────────────────────────────────────
// Sem PATCH parcial no backend: quem chama precisa reenviar a doação inteira
// (mesmo padrão já usado em Professores/Eventos), não só os campos alterados.
export async function updateDoacao(id: string, payload: Doacao): Promise<Doacao> {
  const dto = await apiClient.put<DoacaoAdminDto>(`/api/admin/doacoes/${id}`, toApiPayload(payload));
  return mapDtoToDoacao(dto);
}

// ── DELETE ───────────────────────────────────────────
export async function deleteDoacao(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/doacoes/${id}`);
}

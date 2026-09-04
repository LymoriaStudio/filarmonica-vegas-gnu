import { apiClient } from '../../lib/apiClient'

export interface Apoiador {
  id?: string
  name: string
  company?: string | null
  email: string
  phone: string
  support_type: string
  message?: string | null
  date?: string
  status?: string
  created_at?: string
  updated_at?: string
}

interface PedidoApoioAdminDto {
  id: string;
  nome: string;
  empresa: string | null;
  email: string;
  telefone: string;
  tipoApoio: string;
  mensagem: string | null;
  data: string;
  status: string;
}

// Enum no backend é PascalCase ("Pendente"/"Aprovado"/"Contatado"/"Arquivado");
// a UI usa uma mistura legada pt/en minúscula.
const STATUS_API_TO_UI: Record<string, string> = {
  Pendente: 'pendente',
  Aprovado: 'aprovado',
  Contatado: 'contacted',
  Arquivado: 'arquivado',
};
const STATUS_UI_TO_API: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  contacted: 'Contatado',
  arquivado: 'Arquivado',
};

const mapDtoToApoiador = (dto: PedidoApoioAdminDto): Apoiador => ({
  id: dto.id,
  name: dto.nome,
  company: dto.empresa,
  email: dto.email,
  phone: dto.telefone,
  support_type: dto.tipoApoio,
  message: dto.mensagem,
  date: dto.data,
  status: STATUS_API_TO_UI[dto.status] ?? dto.status,
});

// Fala com o backend próprio (filarmonica-api) — POST /api/pedidos-apoio.
// Continua sendo o formulário público "quero apoiar" (Contact.tsx).
export async function createApoiador(
  payload: Omit<Apoiador, 'id' | 'date' | 'status' | 'created_at' | 'updated_at'>
): Promise<void> {
  await apiClient.post('/api/pedidos-apoio', {
    nome: payload.name,
    empresa: payload.company ?? null,
    email: payload.email,
    telefone: payload.phone,
    tipoApoio: payload.support_type,
    mensagem: payload.message ?? null,
  })
}

// GET — só id/status/created_at dos aprovados, usado para agregações (dashboard)
export async function getApoiadoresAprovadosMinimal(): Promise<Pick<Apoiador, 'id' | 'status' | 'created_at'>[]> {
  const data = await apiClient.get<PedidoApoioAdminDto[]>('/api/admin/pedidos-apoio');
  return data
    .filter(dto => dto.status === 'Aprovado')
    .map(dto => ({ id: dto.id, status: STATUS_API_TO_UI[dto.status] ?? dto.status, created_at: dto.data }));
}

// GET — lista todos os pedidos de apoio, mais recentes primeiro (painel admin)
export async function getApoiadores(): Promise<Apoiador[]> {
  const data = await apiClient.get<PedidoApoioAdminDto[]>('/api/admin/pedidos-apoio');
  return data.map(mapDtoToApoiador);
}

// PATCH — troca de status (usado por promover/arquivar/desarquivar no painel admin)
export async function updateApoiadorStatus(id: string, status: string): Promise<void> {
  await apiClient.patch(`/api/admin/pedidos-apoio/${id}/status`, {
    status: STATUS_UI_TO_API[status] ?? status,
  });
}

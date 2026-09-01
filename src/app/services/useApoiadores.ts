import { supabase } from '../../lib/supabase'
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

// Fala com o backend próprio (filarmonica-api) — POST /api/pedidos-apoio.
// Continua sendo o formulário público "quero apoiar" (Contact.tsx).
//
// ⚠️ Grava no banco NOVO, separado do Supabase que getApoiadores()/
// RelationshipCMS.tsx ainda leem — até a Fase 9 (migração de dados) rodar,
// pedidos feitos aqui NÃO aparecem no painel administrativo. Não fazer
// deploy deste branch em produção antes da Fase 9.
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
  const { data, error } = await supabase
    .from('quero_apoiar')
    .select('id, status, created_at')
    .eq('status', 'aprovado')

  if (error) throw new Error(error.message)
  return data ?? []
}

// GET — lista todos os pedidos de apoio, mais recentes primeiro (painel admin)
export async function getApoiadores(): Promise<Apoiador[]> {
  const { data, error } = await supabase
    .from('quero_apoiar')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// PATCH — troca de status (usado por promover/arquivar/desarquivar no painel admin)
export async function updateApoiadorStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('quero_apoiar')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

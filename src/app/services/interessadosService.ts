import { supabase } from '../../lib/supabase'
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

// ── GET ALL ──────────────────────────────────────────
export async function getInteressados(): Promise<Interessado[]> {
  const { data, error } = await supabase
    .from('interessados')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── GET BY ID ────────────────────────────────────────
export async function getInteressadoById(id: string): Promise<Interessado> {
  const { data, error } = await supabase
    .from('interessados')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ── POST ─────────────────────────────────────────────
// Fala com o backend próprio (filarmonica-api) — POST /api/interessados.
// Continua sendo o formulário público "quero estudar" (Contact.tsx).
//
// ⚠️ Grava no banco NOVO, separado do Supabase que getInteressados()/
// RelationshipCMS.tsx ainda leem — até a Fase 9 (migração de dados) rodar,
// inscrições feitas aqui NÃO aparecem no painel administrativo. Não fazer
// deploy deste branch em produção antes da Fase 9.
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

// ── PUT ──────────────────────────────────────────────
export async function updateInteressado(
  id: string,
  payload: Partial<Omit<Interessado, 'id' | 'created_at'>>
): Promise<Interessado> {
  const { data, error } = await supabase
    .from('interessados')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── DELETE ───────────────────────────────────────────
export async function deleteInteressado(id: string): Promise<void> {
  const { error } = await supabase
    .from('interessados')
    .delete()
    .eq('id', id)

  if (error) throw error
}

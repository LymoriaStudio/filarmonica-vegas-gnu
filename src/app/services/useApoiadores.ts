import { supabase } from '../../lib/supabase'

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

export async function createApoiador(
  payload: Omit<Apoiador, 'id' | 'date' | 'status' | 'created_at' | 'updated_at'>
): Promise<void> {
  const { error } = await supabase
    .from('quero_apoiar')
    .insert([payload])

  if (error) throw error
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

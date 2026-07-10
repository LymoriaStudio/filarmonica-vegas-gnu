import { supabase } from '../../lib/supabase'

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

// ── GET ALL ──────────────────────────────────────────
export async function getDoacoes(): Promise<Doacao[]> {
  const { data, error } = await supabase
    .from('doacoes')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── POST ─────────────────────────────────────────────
export async function createDoacao(
  payload: Omit<Doacao, 'id' | 'date' | 'status' | 'created_at' | 'updated_at'>
): Promise<Doacao> {
  const { data, error } = await supabase
    .from('doacoes')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

// ── PUT ──────────────────────────────────────────────
export async function updateDoacao(
  id: string,
  payload: Partial<Omit<Doacao, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('doacoes')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ── DELETE ───────────────────────────────────────────
export async function deleteDoacao(id: string): Promise<void> {
  const { error } = await supabase
    .from('doacoes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
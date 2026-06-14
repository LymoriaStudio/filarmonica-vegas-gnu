import { supabase } from '../../lib/supabase'

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
export async function createInteressado(
  payload: Omit<Interessado, 'id' | 'date' | 'status' | 'created_at' | 'updated_at'>
): Promise<Interessado> {
  const { data, error } = await supabase
    .from('interessados')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
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

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

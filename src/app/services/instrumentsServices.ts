import { supabase } from '../../lib/supabase';
import { Instrument } from '../validations/types';

const TABLE = 'instruments';

// ==========================================
// MAPPERS: instrumentos (snake_case <-> camelCase)
// ==========================================
const mapInstrumentFromDb = (row: any): Instrument => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  longDescription: row.long_description,
  image: row.image,
  gallery: Array.isArray(row.gallery) ? row.gallery : [],
  videoUrl: row.video_url,
  color: row.color,
});

const mapInstrumentToDb = (instrument: Partial<Instrument>) => ({
  slug: instrument.slug,
  name: instrument.name,
  description: instrument.description,
  long_description: instrument.longDescription,
  image: instrument.image,
  gallery: instrument.gallery ?? [],
  video_url: instrument.videoUrl || null,
  color: instrument.color || null,
});

// ==========================================
// GET (listar todos os instrumentos)
// ==========================================
export async function getInstruments(): Promise<Instrument[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar instrumentos:', error);
    throw error;
  }

  return (data || []).map(mapInstrumentFromDb);
}

// ==========================================
// POST (criar novo instrumento)
// ==========================================
export async function createInstrument(instrument: Partial<Instrument>): Promise<Instrument> {
  const payload = mapInstrumentToDb(instrument);

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar instrumento:', error);
    throw error;
  }

  return mapInstrumentFromDb(data);
}

// ==========================================
// PUT (atualizar instrumento existente)
// ==========================================
export async function updateInstrument(id: string, instrument: Partial<Instrument>): Promise<Instrument> {
  const payload = mapInstrumentToDb(instrument);

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar instrumento:', error);
    throw error;
  }

  return mapInstrumentFromDb(data);
}

// ==========================================
// DELETE (remover instrumento)
// ==========================================
export async function deleteInstrument(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao remover instrumento:', error);
    throw error;
  }
}
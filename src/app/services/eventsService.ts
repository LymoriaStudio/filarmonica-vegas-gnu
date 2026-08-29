import { supabase } from '../../lib/supabase';
import { InstrumentEvent } from '../validations/types';

export interface EventFromDb {
  id: string;
  cover_image: string | null;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  google_maps_url: string | null;
  category: string;
  status: string;
  highlighted: boolean;
  link: string | null;
  is_paid: boolean;
  ticket: number | null;
}

export interface GetEventsOptions {
  /** Se true, retorna apenas eventos com status 'published'. */
  onlyPublished?: boolean;
  /** Se true, ordena por highlighted primeiro (além da data). */
  highlightedFirst?: boolean;
}

// GET — eventos, com filtro opcional por status e ordenação por destaque
export async function getEvents(options: GetEventsOptions = {}): Promise<EventFromDb[]> {
  const { onlyPublished = true, highlightedFirst = false } = options;

  let query = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (onlyPublished) {
    query = query.eq('status', 'published');
  }

  if (highlightedFirst) {
    query = query.order('highlighted', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data as EventFromDb[]) ?? [];
}

// ── Mappers (snake_case DB <-> InstrumentEvent do painel admin) ────────────────
export const mapEventFromDb = (row: any): InstrumentEvent => ({
  id: row.id,
  cover: row.cover_image,
  title: row.title,
  description: row.description,
  date: row.date,
  time: row.time,
  location: row.venue,
  address: row.address,
  mapsUrl: row.google_maps_url,
  category: row.category,
  status: row.status,
  featured: row.highlighted ?? false,
  link: row.link,
  isPaid: row.is_paid ?? false,
  ticket: row.ticket,
});

export const mapEventToDb = (e: Partial<InstrumentEvent>) => ({
  cover_image: e.cover || null,
  title: e.title,
  description: e.description,
  date: e.date,
  time: e.time,
  venue: e.location,
  address: e.address,
  google_maps_url: e.mapsUrl || null,
  category: e.category,
  status: e.status || 'rascunho',
  highlighted: e.featured ?? false,
  link: e.link || null,
  is_paid: e.isPaid ?? false,
  ticket: e.isPaid ? (e.ticket ?? null) : null,
});

type EventDbPayload = ReturnType<typeof mapEventToDb>;

// GET — todos os eventos (painel admin, sem filtro de status)
export async function getAllEventsAdmin(): Promise<InstrumentEvent[]> {
  const data = await getEvents({ onlyPublished: false });
  return data.map(mapEventFromDb);
}

// POST — cria evento
export async function createEvent(payload: EventDbPayload): Promise<InstrumentEvent> {
  const { data, error } = await supabase.from('events').insert(payload).select().single();
  if (error) throw new Error(error.message);
  return mapEventFromDb(data);
}

// PUT — atualiza evento
export async function updateEvent(id: string, payload: EventDbPayload): Promise<InstrumentEvent> {
  const { data, error } = await supabase.from('events').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapEventFromDb(data);
}

// DELETE — remove evento
export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// PATCH — só o destaque (usado pelo toggle de "featured" na listagem)
export async function updateEventHighlighted(id: string, highlighted: boolean): Promise<void> {
  const { error } = await supabase.from('events').update({ highlighted }).eq('id', id);
  if (error) throw new Error(error.message);
}

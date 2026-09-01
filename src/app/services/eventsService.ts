import { supabase } from '../../lib/supabase';
import { apiClient } from '../../lib/apiClient';
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

interface ApiEventoDto {
  id: string;
  imagemCapaUrl: string | null;
  titulo: string;
  descricao: string;
  data: string;
  horario: string | null;
  local: string;
  endereco: string | null;
  googleMapsUrl: string | null;
  categoria: string;
  status: string;
  destaque: boolean;
  link: string | null;
  pago: boolean;
  valorIngresso: number | null;
}

interface ApiPagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// GET — eventos, com filtro opcional por status e ordenação por destaque.
// Fala com o backend próprio (filarmonica-api) — GET /api/eventos.
export async function getEvents(options: GetEventsOptions = {}): Promise<EventFromDb[]> {
  const { onlyPublished = true, highlightedFirst = false } = options;

  const params = new URLSearchParams({ pageSize: '200' });
  if (onlyPublished) params.set('status', 'Publicado');

  const result = await apiClient.get<ApiPagedResult<ApiEventoDto>>(`/api/eventos?${params.toString()}`);

  let items: EventFromDb[] = result.items.map(e => ({
    id: e.id,
    cover_image: e.imagemCapaUrl,
    title: e.titulo,
    description: e.descricao,
    date: e.data,
    time: e.horario ?? '',
    venue: e.local,
    address: e.endereco ?? '',
    google_maps_url: e.googleMapsUrl,
    category: e.categoria,
    status: e.status.toLowerCase(),
    highlighted: e.destaque,
    link: e.link,
    is_paid: e.pago,
    ticket: e.valorIngresso,
  }));

  items.sort((a, b) => a.date.localeCompare(b.date));
  if (highlightedFirst) {
    items = [...items].sort((a, b) => Number(b.highlighted) - Number(a.highlighted));
  }

  return items;
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

// GET — todos os eventos (painel admin, sem filtro de status).
// Continua no Supabase — o CRUD administrativo de eventos (ConteudoCMS.tsx)
// ainda não foi migrado pro backend próprio.
export async function getAllEventsAdmin(): Promise<InstrumentEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return ((data as EventFromDb[]) ?? []).map(mapEventFromDb);
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

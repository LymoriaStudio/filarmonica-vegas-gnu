import { apiClient } from '../../lib/apiClient';
import { uploadMedia } from './mediaService';
import { InstrumentEvent } from '../validations/types';

// O enum do backend (EventoStatus) serializa como "Rascunho"/"Publicado" — o
// front sempre trabalhou com 'rascunho'/'published' (mistura pt/en legada do
// Supabase). Mapeamento explícito nos dois sentidos, não é um simples
// toLowerCase(): "Publicado".toLowerCase() daria "publicado", não "published".
const STATUS_FROM_API: Record<string, string> = { Publicado: 'published', Rascunho: 'rascunho' };
const STATUS_TO_API: Record<string, string> = { published: 'Publicado', rascunho: 'Rascunho' };

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
    status: STATUS_FROM_API[e.status] ?? e.status.toLowerCase(),
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

// ── Admin (ConteudoCMS.tsx) ─────────────────────────────────────────────────
interface AdminEventoDto {
  id: string;
  imagemCapa: string | null; // caminho relativo cru, não URL resolvida
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

function mapAdminDtoToEvent(dto: AdminEventoDto): InstrumentEvent {
  return {
    id: dto.id,
    cover: dto.imagemCapa ?? '',
    title: dto.titulo,
    description: dto.descricao,
    date: dto.data,
    time: (dto.horario ?? '').slice(0, 5), // "HH:mm:ss" -> "HH:mm" pro <input type="time">
    location: dto.local,
    address: dto.endereco ?? '',
    mapsUrl: dto.googleMapsUrl ?? '',
    category: dto.categoria,
    status: STATUS_FROM_API[dto.status] ?? dto.status.toLowerCase(),
    featured: dto.destaque,
    link: dto.link,
    isPaid: dto.pago,
    ticket: dto.valorIngresso,
  } as InstrumentEvent;
}

export const mapEventToDb = (e: Partial<InstrumentEvent>) => {
  const time = e.time && e.time.length === 5 ? `${e.time}:00` : e.time || null;
  return {
    imagemCapa: (e as any).cover || null,
    titulo: e.title,
    descricao: e.description,
    data: e.date,
    horario: time,
    local: e.location,
    endereco: e.address || null,
    googleMapsUrl: (e as any).mapsUrl || null,
    categoria: e.category,
    status: STATUS_TO_API[e.status as string] ?? 'Rascunho',
    destaque: e.featured ?? false,
    link: (e as any).link || null,
    pago: (e as any).isPaid ?? false,
    valorIngresso: (e as any).isPaid ? ((e as any).ticket ?? null) : null,
  };
};

type EventDbPayload = ReturnType<typeof mapEventToDb>;

// GET — todos os eventos (painel admin, sem filtro de status)
export async function getAllEventsAdmin(): Promise<InstrumentEvent[]> {
  const data = await apiClient.get<AdminEventoDto[]>('/api/admin/eventos');
  return data.map(mapAdminDtoToEvent).sort((a, b) => a.date.localeCompare(b.date));
}

// POST — cria evento
export async function createEvent(payload: EventDbPayload): Promise<InstrumentEvent> {
  const dto = await apiClient.post<AdminEventoDto>('/api/admin/eventos', payload);
  return mapAdminDtoToEvent(dto);
}

// PUT — atualiza evento
export async function updateEvent(id: string, payload: EventDbPayload): Promise<InstrumentEvent> {
  const dto = await apiClient.put<AdminEventoDto>(`/api/admin/eventos/${id}`, payload);
  return mapAdminDtoToEvent(dto);
}

// DELETE — remove evento
export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/eventos/${id}`);
}

// Alterna o destaque — o backend não tem um PATCH parcial, então reenviamos
// o objeto inteiro (já disponível no estado local do componente) só com
// `featured` trocado.
export async function updateEventHighlighted(current: InstrumentEvent, highlighted: boolean): Promise<InstrumentEvent> {
  const payload = mapEventToDb({ ...current, featured: highlighted });
  return updateEvent(current.id, payload);
}

// Upload de capa — devolve o caminho relativo, que é o que a API espera
// gravar em imagemCapa (nunca a URL absoluta).
export async function uploadEventCover(file: File): Promise<string> {
  const { caminhoRelativo } = await uploadMedia(file, 'eventos');
  return caminhoRelativo;
}

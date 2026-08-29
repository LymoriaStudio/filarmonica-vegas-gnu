import { supabase } from '../../lib/supabase';

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

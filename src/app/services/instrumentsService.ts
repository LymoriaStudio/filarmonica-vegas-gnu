import { supabase } from '../../lib/supabase';

export interface Instrument {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  videoUrl: string | null;
  color: string;
}

function mapFromDb(row: any): Instrument {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.long_description,
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    videoUrl: row.video_url ?? null,
    color: row.color ?? '#001856',
  };
}

export async function getInstruments(): Promise<Instrument[]> {
  const { data, error } = await supabase
    .from('instruments')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFromDb);
}

import { supabase } from '../../lib/supabase';

export interface PublicBanner {
  id: string;
  image_desktop: string;
  image_mobile: string;
  tag: string | null;
  title: string;
  subtitle: string | null;
  text: string | null;
  primary_btn_text: string | null;
  primary_btn_link: string | null;
  secondary_btn_text: string | null;
  secondary_btn_link: string | null;
  order: number;
  status: string;
}

// GET — banners ativos, ordenados (usado no Hero do site institucional)
export async function getBannersAtivos(): Promise<PublicBanner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('status', 'ativo')
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as PublicBanner[]) ?? [];
}

import { supabase } from '../../lib/supabase';
import { Banner } from '../validations/types';

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

// ── Mappers (snake_case DB <-> Banner do painel admin) ─────────────────────────
export const mapBannerFromDb = (row: any): Banner => ({
  id: row.id,
  imageDesktop: row.image_desktop,
  imageMobile: row.image_mobile,
  tag: row.tag,
  title: row.title,
  subtitle: row.subtitle,
  text: row.text,
  primaryBtnText: row.primary_btn_text,
  primaryBtnLink: row.primary_btn_link,
  secondaryBtnText: row.secondary_btn_text,
  secondaryBtnLink: row.secondary_btn_link,
  order: row.order,
  status: row.status,
});

export const mapBannerToDb = (b: Partial<Banner>) => ({
  image_desktop: b.imageDesktop,
  image_mobile: b.imageMobile,
  tag: b.tag || null,
  title: b.title,
  subtitle: b.subtitle || null,
  text: b.text || null,
  primary_btn_text: b.primaryBtnText || null,
  primary_btn_link: b.primaryBtnLink || null,
  secondary_btn_text: b.secondaryBtnText || null,
  secondary_btn_link: b.secondaryBtnLink || null,
  order: b.order ?? 0,
  status: b.status || 'rascunho',
});

type BannerDbPayload = ReturnType<typeof mapBannerToDb>;

// GET — todos os banners (painel admin, qualquer status), ordenados
export async function getAllBannersAdmin(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(mapBannerFromDb);
}

// POST — cria banner
export async function createBanner(payload: BannerDbPayload): Promise<Banner> {
  const { data, error } = await supabase.from('banners').insert(payload).select().single();
  if (error) throw new Error(error.message);
  return mapBannerFromDb(data);
}

// PUT — atualiza banner
export async function updateBanner(id: string, payload: BannerDbPayload): Promise<Banner> {
  const { data, error } = await supabase.from('banners').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapBannerFromDb(data);
}

// DELETE — remove banner
export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// PATCH — só a ordem (usado tanto pelo swap de mover ↑/↓ quanto pela cadeia de
// deslocamento quando uma nova ordem colide com um banner já existente)
export async function updateBannerOrder(id: string, order: number): Promise<void> {
  const { error } = await supabase.from('banners').update({ order }).eq('id', id);
  if (error) throw new Error(error.message);
}

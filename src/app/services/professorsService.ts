import { supabase } from '../../lib/supabase';

export interface ProfessorDb {
  id?: string;
  photo?: string | null;
  name: string;
  role: string;
  specialty?: string | null;
  instrument: string;
  mini_bio: string;
  full_bio: string;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_youtube?: string | null;
  social_linkedin?: string | null;
  social_whatsapp?: string | null;
  email?: string | null;
  phone?: string | null;
  highlighted?: boolean;
  order?: number;
}

export const mapProfessorFromDb = (row: any) => ({
  id: row.id,
  photo: row.photo ?? '',
  name: row.name,
  role: row.role,
  specialty: row.specialty ?? '',
  instrument: row.instrument,
  miniBio: row.mini_bio,
  fullBio: row.full_bio,
  socialInstagram: row.social_instagram ?? '',
  socialFacebook: row.social_facebook ?? '',
  socialYoutube: row.social_youtube ?? '',
  socialLinkedin: row.social_linkedin ?? '',
  socialWhatsapp: row.social_whatsapp ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  highlighted: row.highlighted ?? false,
  order: row.order ?? 0,
});

export const mapProfessorToDb = (p: any): ProfessorDb => ({
  photo: p.photo || null,
  name: p.name,
  role: p.role,
  specialty: p.specialty || null,
  instrument: p.instrument,
  mini_bio: p.miniBio,
  full_bio: p.fullBio,
  social_instagram: p.socialInstagram || null,
  social_facebook: p.socialFacebook || null,
  social_youtube: p.socialYoutube || null,
  social_linkedin: p.socialLinkedin || null,
  social_whatsapp: p.socialWhatsapp || null,
  email: p.email || null,
  phone: p.phone || null,
  highlighted: p.highlighted ?? false,
  order: p.order ?? 0,
});

export async function getProfessors() {
  const { data, error } = await supabase
    .from('professors')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(mapProfessorFromDb);
}

export async function createProfessor(prof: any) {
  const { data, error } = await supabase
    .from('professors')
    .insert(mapProfessorToDb(prof))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProfessorFromDb(data);
}

export async function updateProfessor(id: string, prof: any) {
  const { data, error } = await supabase
    .from('professors')
    .update(mapProfessorToDb(prof))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProfessorFromDb(data);
}

export async function updateProfessorHighlight(id: string, highlighted: boolean) {
  const { error } = await supabase
    .from('professors')
    .update({ highlighted })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateProfessorOrder(id: string, order: number) {
  const { error } = await supabase
    .from('professors')
    .update({ order })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProfessor(id: string) {
  const { error } = await supabase.from('professors').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
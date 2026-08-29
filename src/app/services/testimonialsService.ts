import { supabase } from '../../lib/supabase';

export interface PublicTestimonial {
  id: number;
  name: string;
  tag: string;
  tag_detail: string;
  text: string;
  order: number;
}

// GET — depoimentos ativos, ordenados (usado na seção pública de depoimentos)
export async function getTestimonialsAtivos(): Promise<PublicTestimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, name, tag, tag_detail, text, order')
    .eq('active', true)
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

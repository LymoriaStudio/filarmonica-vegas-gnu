import { supabase } from '../../lib/supabase';

export interface PublicTestimonial {
  id: number;
  name: string;
  tag: string;
  tag_detail: string;
  text: string;
  order: number;
}

export interface Testimonial extends PublicTestimonial {
  active: boolean;
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

// GET — todos os depoimentos (painel admin), incluindo inativos
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type TestimonialPayload = Omit<Testimonial, 'id'>;

// POST — cria depoimento
export async function createTestimonial(payload: TestimonialPayload): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials').insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// PUT — atualiza depoimento
export async function updateTestimonial(id: number, payload: TestimonialPayload): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// DELETE — remove depoimento
export async function deleteTestimonial(id: number): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

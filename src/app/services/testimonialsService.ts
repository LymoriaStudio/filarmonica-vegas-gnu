import { supabase } from '../../lib/supabase';
import { apiClient } from '../../lib/apiClient';

export interface PublicTestimonial {
  id: string;
  name: string;
  tag: string;
  tag_detail: string;
  text: string;
  order: number;
}

export interface Testimonial extends Omit<PublicTestimonial, 'id'> {
  id: number;
  active: boolean;
}

interface ApiDepoimentoDto {
  id: string;
  nome: string;
  tag: string;
  tagDetalhe: string;
  texto: string;
}

// GET — depoimentos ativos, ordenados (usado na seção pública de depoimentos).
// Fala com o backend próprio (filarmonica-api) — já vem só os ativos, ordenados.
export async function getTestimonialsAtivos(): Promise<PublicTestimonial[]> {
  const data = await apiClient.get<ApiDepoimentoDto[]>('/api/depoimentos');
  return data.map((d, i) => ({
    id: d.id,
    name: d.nome,
    tag: d.tag,
    tag_detail: d.tagDetalhe,
    text: d.texto,
    order: i,
  }));
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

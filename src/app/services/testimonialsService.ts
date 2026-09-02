import { apiClient } from '../../lib/apiClient';

export interface PublicTestimonial {
  id: string;
  name: string;
  tag: string;
  tag_detail: string;
  text: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  tag: string;
  tag_detail: string;
  text: string;
  order: number;
  active: boolean;
}

interface ApiDepoimentoDto {
  id: string;
  nome: string;
  tag: string;
  tagDetalhe: string;
  texto: string;
}

interface AdminDepoimentoDto {
  id: string;
  nome: string;
  tag: string;
  tagDetalhe: string;
  texto: string;
  displayOrder: number;
  active: boolean;
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

function mapAdminDto(dto: AdminDepoimentoDto): Testimonial {
  return {
    id: dto.id,
    name: dto.nome,
    tag: dto.tag,
    tag_detail: dto.tagDetalhe,
    text: dto.texto,
    order: dto.displayOrder,
    active: dto.active,
  };
}

export type TestimonialPayload = Omit<Testimonial, 'id'>;

function toApiPayload(payload: TestimonialPayload) {
  return {
    nome: payload.name,
    tag: payload.tag,
    tagDetalhe: payload.tag_detail,
    texto: payload.text,
    displayOrder: payload.order,
    active: payload.active,
  };
}

// GET — todos os depoimentos (painel admin), incluindo inativos
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const data = await apiClient.get<AdminDepoimentoDto[]>('/api/admin/depoimentos');
  return data.map(mapAdminDto).sort((a, b) => a.order - b.order);
}

// POST — cria depoimento
export async function createTestimonial(payload: TestimonialPayload): Promise<Testimonial> {
  const dto = await apiClient.post<AdminDepoimentoDto>('/api/admin/depoimentos', toApiPayload(payload));
  return mapAdminDto(dto);
}

// PUT — atualiza depoimento
export async function updateTestimonial(id: string, payload: TestimonialPayload): Promise<Testimonial> {
  const dto = await apiClient.put<AdminDepoimentoDto>(`/api/admin/depoimentos/${id}`, toApiPayload(payload));
  return mapAdminDto(dto);
}

// DELETE — remove depoimento
export async function deleteTestimonial(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/depoimentos/${id}`);
}

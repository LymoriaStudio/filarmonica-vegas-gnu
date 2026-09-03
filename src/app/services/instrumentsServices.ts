import { apiClient } from '../../lib/apiClient';
import { uploadMedia } from './mediaService';

export interface AdminInstrumentFoto {
  id: string;
  url: string; // caminho relativo cru
}

export interface AdminInstrument {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string; // caminho relativo cru
  videoUrl: string | null;
  color: string;
  gallery: AdminInstrumentFoto[];
}

interface AdminInstrumentoFotoDto {
  id: string;
  url: string;
  ordem: number;
}

interface AdminInstrumentoDto {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  descricaoLonga: string;
  imagem: string;
  videoUrl: string | null;
  cor: string;
  galeria: AdminInstrumentoFotoDto[];
}

function mapDto(dto: AdminInstrumentoDto): AdminInstrument {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.nome,
    description: dto.descricao,
    longDescription: dto.descricaoLonga,
    image: dto.imagem,
    videoUrl: dto.videoUrl,
    color: dto.cor,
    gallery: [...dto.galeria].sort((a, b) => a.ordem - b.ordem).map(f => ({ id: f.id, url: f.url })),
  };
}

export interface InstrumentFormPayload {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string; // caminho relativo (de mediaService.uploadMedia)
  videoUrl?: string | null;
  color?: string;
}

function toApiPayload(p: InstrumentFormPayload) {
  return {
    slug: p.slug,
    nome: p.name,
    descricao: p.description,
    descricaoLonga: p.longDescription,
    imagem: p.image,
    videoUrl: p.videoUrl || null,
    cor: p.color || '#001856',
  };
}

// GET (listar todos os instrumentos, painel admin)
export async function getInstruments(): Promise<AdminInstrument[]> {
  const data = await apiClient.get<AdminInstrumentoDto[]>('/api/admin/instrumentos');
  return data.map(mapDto);
}

// POST (criar novo instrumento) — sem galeria; fotos são adicionadas depois,
// via addInstrumentPhoto, uma vez que o instrumento já tem id.
export async function createInstrument(payload: InstrumentFormPayload): Promise<AdminInstrument> {
  const dto = await apiClient.post<AdminInstrumentoDto>('/api/admin/instrumentos', toApiPayload(payload));
  return mapDto(dto);
}

// PUT (atualizar instrumento existente) — idem, sem galeria no corpo
export async function updateInstrument(id: string, payload: InstrumentFormPayload): Promise<AdminInstrument> {
  const dto = await apiClient.put<AdminInstrumentoDto>(`/api/admin/instrumentos/${id}`, toApiPayload(payload));
  return mapDto(dto);
}

// DELETE (remover instrumento)
export async function deleteInstrument(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/instrumentos/${id}`);
}

// Upload da imagem principal ou de uma foto de galeria — devolve o caminho
// relativo, que é o que a API espera gravar (nunca a URL absoluta).
export async function uploadInstrumentImage(file: File): Promise<string> {
  const { caminhoRelativo } = await uploadMedia(file, 'instruments');
  return caminhoRelativo;
}

// Adiciona uma foto à galeria (tabela InstrumentoFoto no backend — não é mais
// um array na própria linha do instrumento). Devolve o instrumento atualizado.
export async function addInstrumentPhoto(instrumentId: string, file: File): Promise<AdminInstrument> {
  const caminhoRelativo = await uploadInstrumentImage(file);
  const dto = await apiClient.post<AdminInstrumentoDto>(`/api/admin/instrumentos/${instrumentId}/fotos`, { url: caminhoRelativo });
  return mapDto(dto);
}

// Remove uma foto da galeria pelo id da foto (não mais pela URL).
export async function removeInstrumentPhoto(instrumentId: string, fotoId: string): Promise<AdminInstrument> {
  const dto = await apiClient.delete<AdminInstrumentoDto>(`/api/admin/instrumentos/${instrumentId}/fotos/${fotoId}`);
  return mapDto(dto);
}

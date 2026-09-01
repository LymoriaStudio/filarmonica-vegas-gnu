import { apiClient } from '../../lib/apiClient';

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

interface ApiInstrumentoDto {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  descricaoLonga: string;
  imagemUrl: string;
  videoUrl: string | null;
  cor: string;
  galeriaUrls: string[];
}

function mapFromApi(dto: ApiInstrumentoDto): Instrument {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.nome,
    description: dto.descricao,
    longDescription: dto.descricaoLonga,
    image: dto.imagemUrl,
    gallery: dto.galeriaUrls ?? [],
    videoUrl: dto.videoUrl,
    color: dto.cor || '#001856',
  };
}

// GET — lista de instrumentos (site institucional).
// Fala com o backend próprio (filarmonica-api) — GET /api/instrumentos.
export async function getInstruments(): Promise<Instrument[]> {
  const data = await apiClient.get<ApiInstrumentoDto[]>('/api/instrumentos');
  return data.map(mapFromApi);
}

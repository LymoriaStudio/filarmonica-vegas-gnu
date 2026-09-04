/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, apiUpload } from '../../lib/apiClient';

export interface UploadedMedia {
  id: string;
  caminhoRelativo: string;
  url: string;
}

export interface MediaFile {
  id: string;
  name: string;
  path: string; // caminho relativo
  url: string; // já resolvida pelo backend
  folder: string;
  contentType: string;
  size: number;
  createdAt: string;
}

interface MediaUsoDto {
  emUso: boolean;
  usadoPor: string[];
}

interface MediaAssetDto {
  id: string;
  nomeArquivo: string;
  nomeOriginal: string;
  caminhoRelativo: string;
  url: string;
  pasta: string;
  contentType: string;
  tamanhoBytes: number;
  createdAt: string;
}

// POST /api/admin/media/upload — substitui uploadFileToSupabase() para os
// recursos já migrados pro backend próprio. O backend grava só o CAMINHO
// RELATIVO nas entidades (Banner.ImageDesktop etc.) — é `caminhoRelativo`
// que deve ser enviado de volta no create/update, nunca `url` (a URL
// absoluta é resolvida pelo próprio backend na leitura).
export async function uploadMedia(file: File, pasta: string = 'uploads'): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pasta', pasta);

  const dto = await apiUpload<MediaAssetDto>('/api/admin/media/upload', formData);
  return { id: dto.id, caminhoRelativo: dto.caminhoRelativo, url: dto.url };
}

const mapDtoToMediaFile = (dto: MediaAssetDto): MediaFile => ({
  id: dto.id,
  name: dto.nomeOriginal,
  path: dto.caminhoRelativo,
  url: dto.url,
  folder: dto.pasta,
  contentType: dto.contentType,
  size: dto.tamanhoBytes,
  createdAt: dto.createdAt,
});

// GET /api/admin/media — biblioteca de mídia do painel (substitui listAllMedia())
export async function listMedia(): Promise<MediaFile[]> {
  const data = await apiClient.get<MediaAssetDto[]>('/api/admin/media');
  return data.map(mapDtoToMediaFile);
}

// GET /api/admin/media/{id}/uso — substitui checkMediaUsage(url); agora checa
// pelo id do MediaAsset, não mais pela URL como string.
export async function checkMediaUsage(id: string): Promise<{ inUse: boolean; usedBy: string[] }> {
  const dto = await apiClient.get<MediaUsoDto>(`/api/admin/media/${id}/uso`);
  return { inUse: dto.emUso, usedBy: dto.usadoPor };
}

// DELETE /api/admin/media/{id} — o backend já recusa (409) se o arquivo
// estiver em uso, então checkMediaUsage antes é só pra dar um aviso amigável.
export async function deleteMedia(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/media/${id}`);
}

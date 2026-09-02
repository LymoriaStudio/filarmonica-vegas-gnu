/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiUpload } from '../../lib/apiClient';

export interface UploadedMedia {
  id: string;
  caminhoRelativo: string;
  url: string;
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

import { supabase } from '../../lib/supabase';
const BUCKET = 'filarmonica-media';

// Pastas conhecidas dentro do bucket
const FOLDERS = ['eventos', 'courses', 'professors', 'students'];

export interface StorageMediaFile {
  name: string;
  folder: string;
  path: string;
  url: string;
  size: number | null;
  createdAt: string | null;
}

// ==========================================
// LISTAR TODOS OS ARQUIVOS DE TODAS AS PASTAS
// ==========================================
export async function listAllMedia(): Promise<StorageMediaFile[]> {
  const allFiles: StorageMediaFile[] = [];

  for (const folder of FOLDERS) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error(`Erro ao listar pasta "${folder}":`, error);
      continue;
    }

    (data || [])
      .filter((item) => item.id !== null) // ignora subpastas/placeholders
      .forEach((item) => {
        const path = `${folder}/${item.name}`;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        allFiles.push({
          name: item.name,
          folder,
          path,
          url: urlData.publicUrl,
          size: item.metadata?.size ?? null,
          createdAt: item.created_at ?? null,
        });
      });
  }

  return allFiles;
}

// ==========================================
// VERIFICAR SE O ARQUIVO ESTÁ EM USO
// ==========================================
export async function checkMediaUsage(url: string): Promise<{ inUse: boolean; usedBy: string[] }> {
  const usedBy: string[] = [];

  const checks = [
    { table: 'events', column: 'cover_image', labelColumn: 'title', label: 'Evento' },
    { table: 'courses', column: 'image', labelColumn: 'name', label: 'Curso' },
    { table: 'professors', column: 'photo', labelColumn: 'name', label: 'Professor' },
    { table: 'students', column: 'photo', labelColumn: 'name', label: 'Aluno' },
  ];

  for (const check of checks) {
    const { data, error } = await supabase
      .from(check.table)
      .select(`id, ${check.labelColumn}`)
      .eq(check.column, url);

    if (error) {
      console.error(`Erro ao checar uso em ${check.table}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        usedBy.push(`${check.label}: ${row[check.labelColumn] || row.id}`);
      });
    }
  }

  return { inUse: usedBy.length > 0, usedBy };
}

// ==========================================
// DELETAR ARQUIVO DO STORAGE
// ==========================================
export async function deleteMediaFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}
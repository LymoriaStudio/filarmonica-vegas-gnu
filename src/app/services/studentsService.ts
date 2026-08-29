import { supabase } from '../../lib/supabase';

export interface StudentDb {
  id?: string;
  photo?: string | null;
  name: string;
  birth_date?: string | null;
  instrument: string;
  classroom?: string | null;
  phone: string;
  email: string;
  guardian?: string | null;
  address?: string | null;
  status?: string;
  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  uf?: string | null;
}

// Status da tabela usa pt-BR; a UI usa en.
const STATUS_DB_TO_UI: Record<string, string> = {
  ativo: 'ativo',
  inativo: 'inativo',
  formado: 'formado',
  arquivado: 'arquivado',
};
const STATUS_UI_TO_DB: Record<string, string> = {
  active: 'ativo',
  inactive: 'inativo',
  graduated: 'formado',
  archived: 'arquivado',
};

export const mapStudentFromDb = (row: any) => ({
  id: row.id,
  photo: row.photo ?? '',
  name: row.name,
  birthDate: row.birth_date ?? '',
  instrument: row.instrument,
  classroom: row.classroom ?? '',
  phone: row.phone,
  email: row.email,
  guardian: row.guardian ?? '',
  address: row.address ?? '',
  status: STATUS_DB_TO_UI[row.status] ?? row.status,
  zipCode: row.zip_code ?? '',
  street: row.street ?? '',
  number: row.number ?? '',
  complement: row.complement ?? '',
  neighborhood: row.neighborhood ?? '',
  city: row.city ?? '',
  uf: row.uf ?? '',
});

export const mapStudentToDb = (s: any): StudentDb => ({
  photo: s.photo || null,
  name: s.name,
  birth_date: s.birthDate || null,
  instrument: s.instrument,
  classroom: s.classroom || null,
  phone: s.phone,
  email: s.email,
  guardian: s.guardian || null,
  address: s.address || null,
  status:s.status,
  zip_code: s.zipCode || null,
  street: s.street || null,
  number: s.number || null,
  complement: s.complement || null,
  neighborhood: s.neighborhood || null,
  city: s.city || null,
  uf: s.uf || null,
});

// GET — lista todos os alunos
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(mapStudentFromDb);
}

// GET — só id/created_at, usado para agregações (ex: gráfico de matrículas por mês no dashboard)
export async function getStudentsMinimal(): Promise<{ id: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, created_at');
  if (error) throw new Error(error.message);
  return data ?? [];
}

// POST — cria novo aluno
export async function createStudent(student: any) {
  const { data, error } = await supabase
    .from('students')
    .insert(mapStudentToDb(student))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapStudentFromDb(data);
}

// PUT — atualiza aluno existente
export async function updateStudent(id: string, student: any) {
  const { data, error } = await supabase
    .from('students')
    .update(mapStudentToDb(student))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapStudentFromDb(data);
}

// PATCH status — arquivar, ativar etc
export async function updateStudentStatus(id: string, statusUi: string) {
  const { error } = await supabase
    .from('students')
    .update({ status: STATUS_UI_TO_DB[statusUi] ?? statusUi })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// DELETE — remove permanentemente
export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
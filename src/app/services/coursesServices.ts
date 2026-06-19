import { supabase } from '../../lib/supabase';
import { MusicCourse } from '../validations/types';

const TABLE = 'courses';

// ==========================================
// MAPPERS: cursos (snake_case <-> camelCase)
// ==========================================
const mapCourseFromDb = (row: any): MusicCourse => ({
  id: row.id,
  photo: row.image,
  name: row.name,
  description: row.description,
  ageLimit: row.age_group,
  duration: row.duration,
  vagas: row.available_seats,
  professorId: row.professor_id,
  responsibleProfessor: row.professor_in_charge,

});

const mapCourseToDb = (course: Partial<MusicCourse>) => ({
  image: course.photo,
  name: course.name,
  description: course.description,
  age_group: course.ageLimit,
  duration: course.duration,
  available_seats: course.vagas ?? 0,
  professor_id: course.professorId,
  professor_in_charge: course.responsibleProfessor,
});
// ==========================================
// GET (listar todos os cursos)
// ==========================================
export async function getCourses(): Promise<MusicCourse[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar cursos:', error);
    throw error;
  }

  return (data || []).map(mapCourseFromDb);
}

// ==========================================
// POST (criar novo curso)
// ==========================================
export async function createCourse(course: Partial<MusicCourse>): Promise<MusicCourse> {
  const payload = mapCourseToDb(course);

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar curso:', error);
    throw error;
  }

  return mapCourseFromDb(data);
}

// ==========================================
// PUT (atualizar curso existente)
// ==========================================
export async function updateCourse(id: string, course: Partial<MusicCourse>): Promise<MusicCourse> {
  const payload = mapCourseToDb(course);

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar curso:', error);
    throw error;
  }

  return mapCourseFromDb(data);
}

// ==========================================
// DELETE (remover curso)
// ==========================================
export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao remover curso:', error);
    throw error;
  }
}
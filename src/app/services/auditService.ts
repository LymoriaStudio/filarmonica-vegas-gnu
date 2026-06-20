/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../../lib/supabase';
import { AuditLog } from '../validations/types';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface AuditLogFromDb {
  id: string;
  user_email: string;
  user_name: string;
  action: string;
  date_time: string;
  module: string;
  details: string | null;
  created_at: string;
}

// ─── Mapper: snake_case (DB) → camelCase (UI) ─────────────────────────────────

function mapAuditLogFromDb(row: AuditLogFromDb): AuditLog {
  return {
    id: row.id,
    userEmail: row.user_email,
    userName: row.user_name,
    action: row.action,
    dateTime: new Date(row.date_time).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    module: row.module,
    details: row.details ?? '',
  };
}

// ─── GET: lista os logs mais recentes ────────────────────────────────────────

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('date_time', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAuditLogFromDb);
}

// ─── POST: grava um novo log de auditoria ─────────────────────────────────────

/**
 * Insere um registro de auditoria gravando quem fez (via profiles + auth),
 * o quê (action), em qual módulo, e detalhes adicionais.
 *
 * Fire-and-forget por padrão: não trava a ação do usuário, apenas loga
 * erro no console caso a gravação falhe.
 */
export async function logAuditAction(
  action: string,
  module: string,
  details: string = ''
): Promise<void> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error('Audit log: usuário não autenticado, log não gravado.', authError);
      return;
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email ?? 'desconhecido@sistema';

    // Busca o nome de exibição em profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Audit log: falha ao buscar profile do usuário.', profileError);
    }

    const userName = profile?.name ?? userEmail;

    const { error: insertError } = await supabase.from('audit_logs').insert({
      user_email: userEmail,
      user_name: userName,
      action,
      module,
      details,
    });

    if (insertError) {
      console.error('Audit log: falha ao gravar registro.', insertError);
    }
  } catch (err) {
    // Nunca deixa um erro de auditoria quebrar o fluxo principal do usuário
    console.error('Audit log: erro inesperado.', err);
  }
}
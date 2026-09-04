/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from '../../lib/apiClient';
import { AuditLog } from '../validations/types';

interface AuditLogDto {
  id: string;
  userEmail: string;
  userName: string;
  action: string;
  module: string;
  details: string | null;
  dateTime: string;
}

function mapDtoToAuditLog(dto: AuditLogDto): AuditLog {
  return {
    id: dto.id,
    userEmail: dto.userEmail,
    userName: dto.userName,
    action: dto.action,
    dateTime: new Date(dto.dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    module: dto.module,
    details: dto.details ?? '',
  };
}

// ─── GET: lista os logs mais recentes ────────────────────────────────────────

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const data = await apiClient.get<AuditLogDto[]>(`/api/admin/audit-logs?limit=${limit}`);
  return data.map(mapDtoToAuditLog);
}

// ─── POST: grava um novo log de auditoria ─────────────────────────────────────

/**
 * Fire-and-forget por padrão: não trava a ação do usuário, apenas loga
 * erro no console caso a gravação falhe. user_email/user_name são
 * resolvidos pelo backend a partir do token autenticado — não são
 * enviados por aqui.
 */
export async function logAuditAction(
  action: string,
  module: string,
  details: string = ''
): Promise<void> {
  try {
    await apiClient.post('/api/admin/audit-logs', { action, module, details });
  } catch (err) {
    // Nunca deixa um erro de auditoria quebrar o fluxo principal do usuário
    console.error('Audit log: erro inesperado.', err);
  }
}

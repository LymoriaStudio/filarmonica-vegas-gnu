/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../validations/types';
import { getAuditLogs, logAuditAction } from '../services/auditService';

export function useAuditLogs(limit: number = 100) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await getAuditLogs(limit);
      setAuditLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Mesma assinatura que já é usada hoje em SistemaConfig, SiteCMS, ConteudoCMS, etc:
   * addAuditLog(action, module, details)
   *
   * Grava no banco (fire-and-forget) e atualiza a lista local otimisticamente,
   * para o log aparecer na UI sem esperar um novo fetch completo.
   */
  const addAuditLog = useCallback((action: string, module: string, details: string = '') => {
    // Atualização otimista: mostra o log na hora, com timestamp local
    const optimisticLog: AuditLog = {
      id: `temp-${Date.now()}`,
      userEmail: '',
      userName: 'Você',
      action,
      module,
      details,
      dateTime: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setAuditLogs(prev => [optimisticLog, ...prev]);

    // Grava de fato no banco; depois sincroniza com os dados reais
    logAuditAction(action, module, details).then(() => {
      refresh();
    });
  }, [refresh]);

  return { auditLogs, setAuditLogs, loading, error, addAuditLog, refresh };
}
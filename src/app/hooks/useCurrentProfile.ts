/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { getCurrentProfile, onAuthStateChange, CurrentProfile } from '../services/authService';

export type { CurrentProfile };

export function useCurrentProfile() {
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Mantém o profile sincronizado se o usuário fizer login/logout em outra aba
    const unsubscribe = onAuthStateChange(() => {
      refresh();
    });

    return unsubscribe;
  }, [refresh]);

  return { profile, loading, error, refresh };
}

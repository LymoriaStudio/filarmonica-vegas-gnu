/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface CurrentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useCurrentProfile() {
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setError(authError?.message ?? 'Usuário não autenticado');
        setProfile(null);
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setProfile(null);
        return;
      }

      setProfile({
        id: profileRow.id,
        name: profileRow.name,
        email: authData.user.email ?? '',
        role: profileRow.role,
      });
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
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [refresh]);

  return { profile, loading, error, refresh };
}

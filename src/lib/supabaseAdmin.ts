import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://pvdeubgwcsffxpkqgvng.supabase.co";
const serviceKey  = import.meta.env.VITE_SUPABASE_SERVICE_KEY ?? '';

// Cliente com service_role — bypassa RLS e permite criar/deletar auth users.
// A chave fica no .env (nunca em repositório público).
export const supabaseAdmin = serviceKey
  ? createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

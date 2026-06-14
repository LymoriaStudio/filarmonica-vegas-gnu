import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://pvdeubgwcsffxpkqgvng.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZGV1Ymd3Y3NmZnhwa3Fndm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTgxNjIsImV4cCI6MjA5NjQzNDE2Mn0.BntLdC7Oel916BAPFar3apCBNz9Jc2LunRPKd3tFBOU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
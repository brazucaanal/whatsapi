import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqzsokbvbversmzemenz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxenNva2J2YnZlcnNtemVtZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDEyNTQsImV4cCI6MjA3NjI3NzI1NH0.Gbp3WcVEzasgxRPVOlAJYmhJvWx60PEQWiEVG1iAonE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
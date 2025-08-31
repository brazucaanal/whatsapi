
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lozukfadhkyagimlxhle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvenVrZmFkaGt5YWdpbWx4aGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ0OTksImV4cCI6MjA3MjE3MDQ5OX0.ngQf4pRn94JH5EwmPdSQwH7i3CrVafZ_OA8D0914doM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

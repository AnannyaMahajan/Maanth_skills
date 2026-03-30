import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://itjcfsoxibwnsbncfevc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ausgMTqNtNOeqAAdGfaD4w_1foGqdLF";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

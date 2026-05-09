import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env (VITE_ prefix)
// Falls back to hardcoded values for the deployed web app
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ynhyopxrrpiqiqeljkqy.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_7PhNUjsqgqNJc_YTbZljcQ_dFQdNfdF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

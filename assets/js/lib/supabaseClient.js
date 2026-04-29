     1|import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
     2|import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js'
     3|
     4|export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
     5|
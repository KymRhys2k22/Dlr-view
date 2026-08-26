import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://dxncgchzwmfbbgqpnurq.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HU1x_bM4RBTrZpdplO061A_KjFGrSmD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

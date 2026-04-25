// ecoroute/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jronzqrkrzltinoixent.supabase.co'
const SUPABASE_KEY = 'sb_publishable_tUuv96iMRPyQFMwCySoKhg_Dr4nS0UM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

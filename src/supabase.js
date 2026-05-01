import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lwvacclrdjgharqvjail.supabase.co";
const supabasePublishableKey = "sb_publishable_pCO4WFRMiwa81_K2_rkKGg__UkqH1Zt";

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
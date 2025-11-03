import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

//createClient connects to the backend
//supabase constant will be used in the rest of our project later on
export const supabase = createClient(supabaseUrl, supabaseKey);

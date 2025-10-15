// Wrapper to bypass broken generated Database types. Do not use long-term; fix types generation instead.
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedSupabase } from './client';

// Export an untyped client to avoid 'never' table name errors
export const supabase = typedSupabase as unknown as SupabaseClient<any>;

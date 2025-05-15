
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffhqwgkzqwzvgcotlaot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaHF3Z2t6cXd6dmdjb3RsYW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ1ODUsImV4cCI6MjA2MjgwMDU4NX0.HaYjgj-rQgF674zoJCEIsgLOOpDWgVkZh5icv0K0AKM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

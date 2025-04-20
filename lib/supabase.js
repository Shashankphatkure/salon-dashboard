import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdspgaowvhejxaciguud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc3BnYW93dmhlanhhY2lndXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjg4ODcsImV4cCI6MjA2MDc0NDg4N30.Nb5-CQbLGXNDLacSeqqHossE07d3KpY-_nwD1HZ7vUY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
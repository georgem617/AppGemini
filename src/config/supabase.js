import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno estén configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    );
}

// Crear y exportar cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const appId = 'app-gemini-default';

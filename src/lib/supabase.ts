import { createClient } from '@supabase/supabase-js';

// Substitua pela sua Project URL real do Supabase (ex: https://xyz.supabase.co)
export const supabaseUrl = 'https://SUA_PROJECT_URL.supabase.co';
const supabaseAnonKey = 'sb_publishable_nQSdP2fKXJmvPVUqY-8kCQ_t_aj7XaF';

export const isSupabaseConfigured = !supabaseUrl.includes('SUA_PROJECT_URL');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logActivity = async (userId: string, testName: string) => {
  try {
    // Verificação da URL para evitar erro de JSON input
    if (!isSupabaseConfigured) {
      console.warn('Log de atividade ignorado: Supabase não configurado.');
      return;
    }

    const { error } = await supabase
      .from('logs_atividade')
      .insert([
        { 
          user_id: userId, 
          test_name: testName,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Supabase error logging activity:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error logging activity:', err);
  }
};

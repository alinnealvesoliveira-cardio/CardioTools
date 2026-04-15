import { createClient } from '@supabase/supabase-js';

// Configurações de Acesso - Valores reais inseridos diretamente
export const supabaseUrl = 'https://uqrgvzazowlhzjfprqui.supabase.co';
const supabaseAnonKey = 'sb_publishable_nQSdP2fKXJmvPVUqY-8kCQ_t_aj7XaF';

/**
 * Validação de Configuração
 * Agora simplificada: apenas checa se a URL existe e é válida.
 */
export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  !supabaseUrl.includes('xyz.supabase.co');

// Instância do Cliente (Singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Log de Atividade Clínica
 * Registra o uso dos módulos para fins de auditoria e pesquisa acadêmica (UESB).
 */
export const logActivity = async (userId: string, testName: string) => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Log de atividade ignorado: Instância Supabase não configurada corretamente.');
    return;
  }

  try {
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
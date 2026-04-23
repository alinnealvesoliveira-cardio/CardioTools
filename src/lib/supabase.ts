import { createClient } from '@supabase/supabase-js';

// Lê as variáveis do arquivo .env (ou variáveis de ambiente do Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validação de Configuração
 * Garante que a URL não esteja vazia antes de tentar conectar.
 */
export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  !supabaseUrl.includes('xyz.supabase.co'); // Proteção contra configuração padrão

// Instância do Cliente (Singleton)
// Se não estiver configurado, criamos um cliente vazio ou tratamos o erro
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Log de Atividade Clínica
 * Registra o uso dos módulos para fins de auditoria e pesquisa acadêmica (UESB).
 */
export const logActivity = async (userId: string, testName: string) => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Log de atividade ignorado: Instância Supabase não configurada.');
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
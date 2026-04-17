/// <reference types="vite/client" />
declare module "*.css";
/**
 * Definição das Variáveis de Ambiente do Vite.
 * Garante o preenchimento automático (autocomplete) e a segurança de tipos 
 * ao utilizar import.meta.env.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Adicione outras variáveis começadas com VITE_ aqui conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
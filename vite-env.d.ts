/// <reference types="vite/client" />

declare module "*.css";

/**
 * Definição das Variáveis de Ambiente do Vite.
 * Estendemos a interface ImportMetaEnv para que o TypeScript 
 * reconheça suas variáveis customizadas com autocomplete.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Adicione outras variáveis começadas com VITE_ aqui, se precisar
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
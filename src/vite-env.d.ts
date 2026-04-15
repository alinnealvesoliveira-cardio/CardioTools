/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Sintaxe minimalista: sem nomes de variáveis internas para evitar sublinhados vermelhos
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
declare module "*.png";
declare module "*.svg";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
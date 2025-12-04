/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INDEXER_URL?: string;
  readonly VITE_CRYPTOCOMPARE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.csv?raw' {
  const content: string;
  export default content;
}

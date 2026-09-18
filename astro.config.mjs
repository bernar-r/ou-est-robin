// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  // Publié sur https://bernar-r.github.io/ou-est-robin/
  site: 'https://bernar-r.github.io',
  base: '/ou-est-robin',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    // Le type de plugin exposé par Tailwind 4 diverge de celui du Vite embarqué dans Astro.
    plugins: [/** @type {any} */ (tailwindcss())],
    build: {
      // maplibre-gl est volumineux : on l'isole pour qu'il reste en chargement différé.
      chunkSizeWarningLimit: 1200,
    },
  },
});

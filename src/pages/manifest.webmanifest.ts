import type { APIRoute } from 'astro';
import { lien } from '../lib/lien';

// Généré plutôt que statique : les chemins doivent inclure le sous-dossier GitHub Pages.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: 'Le voyage de Robin',
        short_name: 'Voyage Robin',
        description: 'Suivre le voyage de Robin en Thaïlande et au Laos, jour après jour.',
        lang: 'fr',
        dir: 'ltr',
        start_url: lien('/'),
        scope: lien('/'),
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf7f0',
        theme_color: '#fbf7f0',
        icons: [
          { src: lien('/icones/icone-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: lien('/icones/icone-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: lien('/icones/icone-maskable-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );

import brut from './statut.json';
import { validerStatut } from './schema';

/** Validé au build : un statut mal rempli fait échouer la mise en ligne, jamais la page du visiteur. */
export const STATUT = validerStatut(brut);

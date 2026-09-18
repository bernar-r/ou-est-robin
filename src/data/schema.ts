import { z } from 'zod';

/** Modes de déplacement affichés sur la carte et dans la frise. */
export const TRANSPORTS = {
  avion: { label: 'En avion', emoji: '✈️', couleur: '#0E7490' },
  train: { label: 'En train', emoji: '🚆', couleur: '#6D28D9' },
  bus: { label: 'En bus', emoji: '🚌', couleur: '#B45309' },
  moto: { label: 'À moto', emoji: '🏍️', couleur: '#C2410C' },
  bateau: { label: 'En barque', emoji: '🛶', couleur: '#0E7490' },
  marche: { label: 'À pied', emoji: '🥾', couleur: '#047857' },
  surplace: { label: 'Sur place', emoji: '🏡', couleur: '#57534E' },
} as const;

export type Transport = keyof typeof TRANSPORTS;

const coordonneesSchema = z
  .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
  .describe('Longitude puis latitude, comme attendu par MapLibre');

export const jourSchema = z.object({
  jour: z.number().int().min(0).max(24),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format AAAA-MM-JJ'),
  ville: z.string().min(1),
  pays: z.enum(['Thaïlande', 'Laos', 'En vol']),
  drapeau: z.string().min(1),
  coordonnees: coordonneesSchema,
  titreSimple: z.string().min(1),
  resumeFamille: z.string().min(20),
  tempsFort: z.string().min(1),
  dortA: z.string().min(1),
  transport: z.custom<Transport>((v) => typeof v === 'string' && v in TRANSPORTS),
  photo: z.string().url(),
});

export type Jour = z.infer<typeof jourSchema> & { transport: Transport };

export const statutSchema = z.object({
  derniereNouvelleISO: z.string().datetime({ offset: true }),
  messageDeRobin: z.string(),
  villeReelle: z.string().nullable(),
  toutVaBien: z.boolean(),
  prochainContactPrevu: z.string(),
});

export type Statut = z.infer<typeof statutSchema>;

/**
 * Échoue le build (et pas le navigateur du visiteur) si une donnée est incohérente.
 */
export function validerItineraire(jours: unknown): Jour[] {
  const valides = z.array(jourSchema).min(25).max(25).parse(jours) as Jour[];

  valides.forEach((j, i) => {
    if (j.jour !== i) {
      throw new Error(`Itinéraire : le jour à l'index ${i} est numéroté ${j.jour}.`);
    }
    if (i > 0) {
      const veille = Date.parse(`${valides[i - 1]!.dateISO}T00:00:00Z`);
      const jourCourant = Date.parse(`${j.dateISO}T00:00:00Z`);
      if (jourCourant - veille !== 86_400_000) {
        throw new Error(`Itinéraire : ${j.dateISO} ne suit pas immédiatement ${valides[i - 1]!.dateISO}.`);
      }
    }
  });

  return valides;
}

export function validerStatut(statut: unknown): Statut {
  return statutSchema.parse(statut);
}

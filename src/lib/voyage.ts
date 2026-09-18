import { DATE_ATTERRISSAGE_ISO, ITINERAIRE } from '../data/itineraire';
import type { Jour } from '../data/schema';

/** Tout le voyage se déroule en Indochine : un seul fuseau, sans heure d'été. */
export const FUSEAU_VOYAGE = 'Asia/Bangkok';
export const FUSEAU_FAMILLE = 'Europe/Paris';

/** Au-delà de ce silence, on affiche un encart explicatif rassurant. */
export const SEUIL_SILENCE_JOURS = 3;

type Champs = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

function champsEnZone(date: Date, fuseau: string): Record<Champs, string> {
  const parties = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuseau,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const resultat = {} as Record<Champs, string>;
  for (const partie of parties) {
    if (partie.type !== 'literal') resultat[partie.type as Champs] = partie.value;
  }
  return resultat;
}

export function dateISOEnZone(date: Date, fuseau: string = FUSEAU_VOYAGE): string {
  const c = champsEnZone(date, fuseau);
  return `${c.year}-${c.month}-${c.day}`;
}

export function heureEnZone(date: Date, fuseau: string = FUSEAU_VOYAGE): string {
  const c = champsEnZone(date, fuseau);
  return `${c.hour}h${c.minute}`;
}

function decalageMinutes(date: Date, fuseau: string): number {
  const c = champsEnZone(date, fuseau);
  const commeUTC = Date.UTC(
    Number(c.year),
    Number(c.month) - 1,
    Number(c.day),
    Number(c.hour),
    Number(c.minute),
    Number(c.second),
  );
  return Math.round((commeUTC - Math.floor(date.getTime() / 1000) * 1000) / 60_000);
}

/** Varie pendant le voyage : la France repasse à l'heure d'hiver le 25 octobre 2026. */
export function decalageAvecLaFrance(date: Date): number {
  return (decalageMinutes(date, FUSEAU_VOYAGE) - decalageMinutes(date, FUSEAU_FAMILLE)) / 60;
}

function enMinuit(dateISO: string): number {
  return Date.parse(`${dateISO}T00:00:00Z`);
}

function ecartEnJours(depuisISO: string, versISO: string): number {
  return Math.round((enMinuit(versISO) - enMinuit(depuisISO)) / 86_400_000);
}

export type EtatVoyage = 'avant' | 'pendant' | 'apres';

export interface Situation {
  etat: EtatVoyage;
  /** -1 avant le départ, 0 à 24 pendant, 25 après le retour. */
  index: number;
  jour: Jour | null;
  numeroAffiche: number;
  totalJours: number;
  joursAvantDepart: number;
  joursAvantRetour: number;
  progressionPourcent: number;
  dateISO: string;
}

/**
 * Détermine où en est le voyage à partir de la date réelle, en heure locale d'Asie.
 * Appelée au build (premier rendu) puis à nouveau dans le navigateur (valeur toujours à jour).
 */
export function situationAu(maintenant: Date = new Date()): Situation {
  const aujourdhui = dateISOEnZone(maintenant, FUSEAU_VOYAGE);
  const total = ITINERAIRE.length;
  const premier = ITINERAIRE[0]!;
  const dernier = ITINERAIRE[total - 1]!;

  const index = ITINERAIRE.findIndex((j) => j.dateISO === aujourdhui);
  const joursAvantDepart = Math.max(0, ecartEnJours(aujourdhui, premier.dateISO));
  const joursAvantRetour = Math.max(0, ecartEnJours(aujourdhui, DATE_ATTERRISSAGE_ISO));

  if (aujourdhui < premier.dateISO) {
    return {
      etat: 'avant',
      index: -1,
      jour: null,
      numeroAffiche: 0,
      totalJours: total,
      joursAvantDepart,
      joursAvantRetour,
      progressionPourcent: 0,
      dateISO: aujourdhui,
    };
  }

  if (index === -1 || aujourdhui > dernier.dateISO) {
    return {
      etat: 'apres',
      index: total,
      jour: null,
      numeroAffiche: total,
      totalJours: total,
      joursAvantDepart: 0,
      joursAvantRetour: 0,
      progressionPourcent: 100,
      dateISO: aujourdhui,
    };
  }

  return {
    etat: 'pendant',
    index,
    jour: ITINERAIRE[index]!,
    numeroAffiche: index + 1,
    totalJours: total,
    joursAvantDepart: 0,
    joursAvantRetour,
    progressionPourcent: Math.round(((index + 1) / total) * 100),
    dateISO: aujourdhui,
  };
}

export function joursDepuis(horodatageISO: string, maintenant: Date = new Date()): number {
  const depuis = Date.parse(horodatageISO);
  if (Number.isNaN(depuis)) return 0;
  return Math.max(0, Math.floor((maintenant.getTime() - depuis) / 86_400_000));
}

const formatDateLongue = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function dateEnFrancais(dateISO: string): string {
  return formatDateLongue.format(new Date(`${dateISO}T12:00:00Z`));
}

const formatDateCourte = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

export function dateCourteEnFrancais(dateISO: string): string {
  return formatDateCourte.format(new Date(`${dateISO}T12:00:00Z`));
}

export function horodatageEnFrancais(horodatageISO: string): string {
  const date = new Date(horodatageISO);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU_FAMILLE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function accorderJours(nombre: number): string {
  return nombre <= 1 ? `${nombre} jour` : `${nombre} jours`;
}

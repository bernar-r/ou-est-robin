import { ITINERAIRE } from '../data/itineraire';
import { TRANSPORTS } from '../data/schema';
import { STATUT } from '../data/statut';
import {
  accorderJours,
  dateEnFrancais,
  decalageAvecLaFrance,
  FUSEAU_VOYAGE,
  heureEnZone,
  joursDepuis,
  SEUIL_SILENCE_JOURS,
  situationAu,
} from '../lib/voyage';

/**
 * Le site est généré une fois, mais il doit rester juste tous les jours.
 * Ce script recalcule l'étape du jour dans le navigateur, à la date réelle du visiteur.
 */

function texte(id: string, valeur: string): void {
  const element = document.getElementById(id);
  if (element && element.textContent !== valeur) element.textContent = valeur;
}

function rafraichirEtape(): void {
  const situation = situationAu();
  const jour = situation.jour;
  const premier = ITINERAIRE[0]!;

  if (situation.etat === 'pendant' && jour) {
    const ville = STATUT.villeReelle ?? jour.ville;
    texte('surtitre', `Aujourd’hui, ${dateEnFrancais(situation.dateISO)}`);
    texte('titre-texte', `Robin est à ${ville}`);
    texte('titre-drapeau', ` ${jour.drapeau}`);
    texte('resume-jour', jour.resumeFamille);
    texte('compteur-jour', `Jour ${situation.numeroAffiche} sur ${situation.totalJours}`);
    texte('compte-a-rebours', `Retour dans ${accorderJours(situation.joursAvantRetour)}`);
    texte('info-transport', TRANSPORTS[jour.transport].label);
    texte('info-transport-emoji', TRANSPORTS[jour.transport].emoji);
    texte('info-dort', jour.dortA);

    const photo = document.getElementById('photo-jour');
    if (photo instanceof HTMLImageElement && photo.getAttribute('src') !== jour.photo) {
      photo.src = jour.photo;
    }
  } else if (situation.etat === 'avant') {
    texte('surtitre', `Départ le ${dateEnFrancais(premier.dateISO)}`);
    texte('titre-texte', `Robin part dans ${accorderJours(situation.joursAvantDepart)}`);
    texte('titre-drapeau', '');
    texte('compteur-jour', `Voyage de ${situation.totalJours} jours`);
    texte('compte-a-rebours', `Départ dans ${accorderJours(situation.joursAvantDepart)}`);
  } else {
    texte('surtitre', 'Voyage terminé');
    texte('titre-texte', 'Robin est bien rentré');
    texte('titre-drapeau', '');
    texte(
      'resume-jour',
      'Le voyage est terminé et Robin a atterri à Genève. Vous pouvez revoir toutes les étapes du parcours.',
    );
    texte('compteur-jour', `Voyage de ${situation.totalJours} jours`);
    texte('compte-a-rebours', 'Arrivé à Genève le 30 octobre');
  }

  const barre = document.getElementById('barre-progression');
  const remplissage = document.getElementById('barre-remplissage');
  if (barre && remplissage) {
    barre.setAttribute('aria-valuenow', String(situation.progressionPourcent));
    remplissage.style.width = `${situation.progressionPourcent}%`;
  }
}

function rafraichirHorloge(): void {
  const maintenant = new Date();
  texte('info-heure', heureEnZone(maintenant, FUSEAU_VOYAGE));

  const decalage = decalageAvecLaFrance(maintenant);
  texte(
    'info-decalage',
    decalage === 0 ? 'Même heure qu’en France' : `${decalage} h de plus qu’en France`,
  );
}

function rafraichirSilence(): void {
  const encart = document.getElementById('encart-silence');
  if (!encart) return;

  const silence = joursDepuis(STATUT.derniereNouvelleISO);
  const situation = situationAu();
  const doitAfficher = situation.etat === 'pendant' && silence >= SEUIL_SILENCE_JOURS;

  encart.hidden = !doitAfficher;
  if (doitAfficher) texte('silence-nombre', String(silence));
}

function toutRafraichir(): void {
  rafraichirEtape();
  rafraichirHorloge();
  rafraichirSilence();
}

toutRafraichir();
window.setInterval(rafraichirHorloge, 30_000);

// Un téléphone rouvert le lendemain doit afficher la bonne étape sans rechargement manuel.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) toutRafraichir();
});

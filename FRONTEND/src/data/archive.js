// src/data/archive.js

/**
 * Sauvegarde une visite
 * - Console log pour debug
 * - Stockage dans localStorage
 * - Création d'une clé unique adresse + bâtiment
 */
export function saveVisit(visit) {
  console.log("Visite sauvegardée :", visit);

  // Récupérer toutes les visites existantes
  const allVisits = JSON.parse(localStorage.getItem("visites") || "[]");

  // Clé unique : adresse principale + nom du bâtiment si présent
  const key = visit.adresse.principale + (visit.adresse.batiment?.nom || "");
  visit.key = key;

  // Ajouter la visite
  allVisits.push(visit);

  // Enregistrer dans localStorage
  localStorage.setItem("visites", JSON.stringify(allVisits));
}

/**
 * Récupérer toutes les visites
 */
export function getVisits() {
  return JSON.parse(localStorage.getItem("visites") || "[]");
}

/**
 * Filtrer les visites par bâtiment
 * @param {string} buildingName - nom du bâtiment
 * @returns {Array} visites correspondantes
 */
export function getVisitsByBuilding(buildingName) {
  const allVisits = getVisits();
  return allVisits.filter(v => v.adresse.batiment?.nom === buildingName);
}

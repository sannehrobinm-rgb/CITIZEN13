// /src/data/questions.js
export const questions = [
  // ================== Écran 2 – Inscription & participation électorale ==================
  {
    id: "inscrit_listes",
    label: "Êtes-vous inscrit(e) sur les listes électorales ?",
    type: "radio",
    options: ["Oui", "Non", "Je ne sais pas"],
    screen: 2
  },
  {
    id: "intention_vote",
    label: "Pensez-vous aller voter aux prochaines élections municipales ?",
    type: "radio",
    options: ["Oui", "Non", "J’hésite"],
    screen: 2
  },

  // ================== Écran 3 – Freins & information ==================
  {
    id: "raisons_non_vote",
    label: "Qu’est-ce qui vous freine le plus aujourd’hui ?",
    type: "checkbox",
    options: ["Manque d’intérêt", "Déception politique", "Impression que ça ne sert à rien", "Manque d’informations", "Autre"],
    screen: 3
  },
  {
    id: "raison_autre_texte",
    label: "Si autre, précisez :",
    type: "text",
    screen: 3
  },
  {
    id: "info_municipales",
    label: "Savez-vous comment se déroulent les élections municipales à Paris ?",
    type: "radio",
    options: ["Oui", "Non"],
    screen: 3
  },

  // ================== Écran 4 – Intérêt citoyen & priorités ==================
  {
    id: "interets",
    label: "Êtes-vous intéressé(e) par une démarche citoyenne locale dans votre quartier ?",
    type: "radio",
    options: ["Oui", "Non", "À discuter"],
    screen: 4
  },
  {
    id: "preoccupations",
    label: "Qu’est-ce qui vous préoccupe le plus dans le quartier ?",
    type: "text",
    screen: 4
  },

  // ================== Écran 5 – Thèmes & propositions ==================
  {
    id: "themes",
    label: "Parmi ces sujets, lesquels vous parlent le plus ?",
    type: "checkbox",
    options: ["Logements vides", "Référendum incinérateur", "RIC municipal", "Minimum social garanti", "Aucun"],
    screen: 5
  },
  {
    id: "propositions",
    label: "Avez-vous des idées ou propositions pour améliorer le quartier ?",
    type: "text",
    screen: 5
  },

  // ================== Écran 6 – Suivi & soutien ==================
  {
    id: "souhait_suivi",
    label: "Souhaitez-vous rester en contact avec nous ?",
    type: "checkbox",
    options: ["Être informé(e)", "Recevoir le programme", "Participer", "Non"],
    screen: 6
  },
  {
    id: "contact_accord",
    label: "Accord pour être recontacté ?",
    type: "radio",
    options: ["Oui", "Non"],
    screen: 6
  },
  {
    id: "telephone",
    label: "Téléphone",
    type: "text",
    screen: 6
  },
  {
    id: "email",
    label: "Email",
    type: "text",
    screen: 6
  },
  {
    id: "soutien_asso",
    label: "Souhaitez-vous soutenir l’association ?",
    type: "radio",
    options: ["Faire un don", "Adhérer", "Pas pour le moment"],
    screen: 6
  }
];

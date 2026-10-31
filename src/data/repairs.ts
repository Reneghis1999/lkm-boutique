/**
 * Tarifs de réparation affichés sur le site.
 *
 * ⚠️ Prix INDICATIFS (provisoires) : à ajuster avec le client.
 * - `partFrom` : prix de la pièce « à partir de » (+ main d’œuvre REPAIR_LABOR)
 * - `service`  : forfait sans pièce (main d’œuvre comprise)
 */
export const REPAIR_LABOR = 2000;

export type RepairCategory = "phone" | "computer" | "console";

export type RepairItem = {
  id: string;
  category: RepairCategory;
  title: string;
  description: string;
  icon: string;
  partFrom?: number;
  service?: number;
  popular?: boolean;
};

export const repairCategories: { id: RepairCategory; label: string; icon: string }[] = [
  { id: "phone", label: "Téléphones & tablettes", icon: "Smartphone" },
  { id: "computer", label: "Ordinateurs", icon: "Laptop" },
  { id: "console", label: "Consoles & manettes", icon: "Gamepad2" },
];

export const repairItems: RepairItem[] = [
  // Téléphones & tablettes
  {
    id: "ecran",
    category: "phone",
    title: "Changement d’écran",
    description: "Écran cassé, tactile qui ne répond plus, taches ou lignes.",
    icon: "Smartphone",
    partFrom: 15000,
    popular: true,
  },
  {
    id: "batterie",
    category: "phone",
    title: "Changement de batterie",
    description: "Batterie qui gonfle, se décharge vite ou téléphone qui s’éteint.",
    icon: "BatteryCharging",
    partFrom: 8000,
    popular: true,
  },
  {
    id: "camera",
    category: "phone",
    title: "Caméra avant / arrière",
    description: "Photos floues, caméra noire ou vitre de caméra cassée.",
    icon: "Camera",
    partFrom: 10000,
    popular: true,
  },
  {
    id: "charge",
    category: "phone",
    title: "Connecteur de charge",
    description: "Le téléphone ne charge plus, ou seulement en tenant le câble.",
    icon: "Plug",
    partFrom: 5000,
    popular: true,
  },
  {
    id: "vitre-arriere",
    category: "phone",
    title: "Vitre arrière",
    description: "Dos en verre fissuré ou éclaté.",
    icon: "Smartphone",
    partFrom: 10000,
  },
  {
    id: "son",
    category: "phone",
    title: "Haut-parleur, écouteur & micro",
    description: "On ne vous entend plus, son faible ou qui grésille.",
    icon: "Speaker",
    partFrom: 5000,
  },
  {
    id: "boutons",
    category: "phone",
    title: "Boutons & vibreur",
    description: "Bouton power ou volume bloqué, vibreur qui ne marche plus.",
    icon: "Wrench",
    partFrom: 4000,
  },
  {
    id: "eau",
    category: "phone",
    title: "Tombé dans l’eau",
    description: "Nettoyage et désoxydation de la carte avant qu’elle ne s’abîme.",
    icon: "Droplets",
    service: 7000,
  },
  {
    id: "tablette",
    category: "phone",
    title: "Écran de tablette / iPad",
    description: "Vitre cassée ou affichage qui ne s’allume plus.",
    icon: "Tablet",
    partFrom: 25000,
  },
  {
    id: "logiciel",
    category: "phone",
    title: "Flash & mise à jour",
    description: "Téléphone bloqué au logo, très lent ou mise à jour impossible.",
    icon: "RefreshCw",
    service: 5000,
  },
  {
    id: "donnees",
    category: "phone",
    title: "Récupération de données",
    description: "Photos, contacts et fichiers d’un téléphone en panne.",
    icon: "HardDrive",
    service: 10000,
  },

  // Ordinateurs
  {
    id: "ecran-pc",
    category: "computer",
    title: "Écran de PC portable",
    description: "Écran cassé, noir ou avec des lignes.",
    icon: "Laptop",
    partFrom: 35000,
    popular: true,
  },
  {
    id: "batterie-pc",
    category: "computer",
    title: "Batterie de PC portable",
    description: "Autonomie très faible ou PC qui s’éteint sans chargeur.",
    icon: "BatteryCharging",
    partFrom: 20000,
  },
  {
    id: "clavier-pc",
    category: "computer",
    title: "Clavier de PC portable",
    description: "Touches qui ne répondent plus ou liquide renversé.",
    icon: "Keyboard",
    partFrom: 15000,
  },
  {
    id: "charge-pc",
    category: "computer",
    title: "Prise de charge du PC",
    description: "Le PC ne charge plus ou seulement par moments.",
    icon: "Plug",
    partFrom: 8000,
  },
  {
    id: "nettoyage-pc",
    category: "computer",
    title: "Nettoyage & pâte thermique",
    description: "PC qui chauffe, ventilateur bruyant, ralentissements.",
    icon: "Fan",
    service: 8000,
  },
  {
    id: "windows",
    category: "computer",
    title: "Installation Windows & logiciels",
    description: "Formatage, virus, PC très lent au démarrage.",
    icon: "RefreshCw",
    service: 10000,
  },
  {
    id: "upgrade",
    category: "computer",
    title: "Ajout SSD ou mémoire RAM",
    description: "Un PC beaucoup plus rapide sans le remplacer.",
    icon: "Cpu",
    partFrom: 15000,
  },

  // Consoles & manettes
  {
    id: "hdmi",
    category: "console",
    title: "Port HDMI de console",
    description: "Plus d’image sur la télé (PS4, PS5, Xbox).",
    icon: "MonitorPlay",
    partFrom: 10000,
    popular: true,
  },
  {
    id: "nettoyage-console",
    category: "console",
    title: "Nettoyage de console",
    description: "Console qui chauffe, s’éteint ou fait beaucoup de bruit.",
    icon: "Fan",
    service: 8000,
  },
  {
    id: "lecteur",
    category: "console",
    title: "Lecteur de disque",
    description: "La console ne lit plus ou n’éjecte plus les jeux.",
    icon: "Disc3",
    partFrom: 15000,
  },
  {
    id: "joystick",
    category: "console",
    title: "Joystick de manette (drift)",
    description: "Le personnage bouge tout seul ou le stick accroche.",
    icon: "Gamepad2",
    partFrom: 5000,
  },
  {
    id: "charge-manette",
    category: "console",
    title: "Charge de manette",
    description: "La manette ne charge plus ou ne s’allume plus.",
    icon: "Plug",
    partFrom: 4000,
  },
];

export const deviceTypes = [
  "Téléphone",
  "Tablette / iPad",
  "Ordinateur portable",
  "Ordinateur de bureau",
  "Console",
  "Manette",
  "Autre",
];

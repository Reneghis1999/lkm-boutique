import type { RepairService } from "@/types";

export const repairServices: RepairService[] = [
  {
    id: "diagnostic",
    title: "Diagnostic rapide",
    description:
      "Analyse complète de votre smartphone ou ordinateur pour identifier la panne avant intervention.",
    icon: "Search",
  },
  {
    id: "mobile",
    title: "Réparation mobile",
    description:
      "Écrans, batteries, connecteurs de charge, caméras et pièces de rechange pour téléphones.",
    icon: "Smartphone",
  },
  {
    id: "pc",
    title: "Réparation PC",
    description:
      "Maintenance, remplacement de composants, nettoyage et remise en état d’ordinateurs portables.",
    icon: "Laptop",
  },
  {
    id: "custom",
    title: "Intervention sur mesure",
    description:
      "Solutions adaptées à votre matériel, avec pièces disponibles en magasin à Djidjolé.",
    icon: "Wrench",
  },
];

export const valueProps = [
  {
    title: "Prix en ligne",
    description: "Consultez nos tarifs, puis venez tester en magasin.",
    icon: "Tag",
  },
  {
    title: "Deux boutiques",
    description: "Léo 2000 pour l’achat, Djidjolé pour la réparation.",
    icon: "MapPin",
  },
  {
    title: "Tech & Gaming",
    description: "Smartphones, PC, consoles, jeux et accessoires.",
    icon: "Gamepad2",
  },
  {
    title: "Commande WhatsApp",
    description: "Réservez vos articles et validez en un message.",
    icon: "MessageCircle",
  },
];

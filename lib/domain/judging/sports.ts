import { SportDefinition } from "./types";

const levels = {
  1: "Alkeistaso, merkittäviä puutteita",
  2: "Perustaso, useita virheitä",
  3: "Kehittyvä, osin hallittu",
  4: "Hyvä, enimmäkseen hallittu",
  5: "Erittäin hyvä, varma suoritus",
  6: "Erinomainen, kilpailutasoinen",
};

export const SPORTS: SportDefinition[] = [
  {
    id: "dance-standard-latin",
    label: "Tanssi",
    style: "Vakio & Latin",
    rubric: [
      {
        id: "technique",
        label: "Tekniikka",
        criteria: [
          { id: "posture", label: "Asento", description: "Linjaukset, runko, kannatus", levelDescriptions: levels },
          { id: "footwork", label: "Jalkatekniikka", description: "Askelten laatu ja tarkkuus", levelDescriptions: levels },
          { id: "timing", label: "Ajoitus", description: "Rytmissä pysyminen", levelDescriptions: levels },
        ],
      },
      {
        id: "partnership",
        label: "Parityöskentely",
        criteria: [
          { id: "connection", label: "Yhteys", description: "Parin välinen kontakti", levelDescriptions: levels },
          { id: "leadfollow", label: "Vienti & Seuraaminen", description: "Selkeys ja reagointi", levelDescriptions: levels },
        ],
      },
      {
        id: "musicality",
        label: "Musiikillisuus",
        criteria: [
          { id: "phrasing", label: "Fraasitus", description: "Musiikin tulkinta", levelDescriptions: levels },
          { id: "dynamics", label: "Dynamiikka", description: "Nopeuden ja energian vaihtelut", levelDescriptions: levels },
          { id: "expression", label: "Ilmaisu", description: "Esiintyminen ja tunnelma", levelDescriptions: levels },
        ],
      },
      {
        id: "presentation",
        label: "Kokonaisvaikutelma",
        criteria: [
          { id: "floorcraft", label: "Floorcraft", description: "Tilankäyttö ja turvallisuus", levelDescriptions: levels },
          { id: "consistency", label: "Tasaisuus", description: "Suorituksen vakaus", levelDescriptions: levels },
          { id: "impact", label: "Vaikutelma", description: "Kilpailullinen kokonaisuus", levelDescriptions: levels },
        ],
      },
    ],
  },
];

export function getSportDefinition(sportId: string) {
  return SPORTS.find((sport) => sport.id === sportId) ?? SPORTS[0];
}

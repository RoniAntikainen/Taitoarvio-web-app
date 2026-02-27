import type { Rubric } from "@/domain/models";

export const SPORT_RUBRICS: Record<string, Rubric> = {
  dance: {
    id: "dance-v1",
    sportId: "dance",
    name: "Tanssi — syvä katsastelu",
    criteria: [
      {
        id: "technique",
        label: "Tekniikka",
        weight: 0.4,
        levels: [
          { level: 1, title: "Alkeis", description: "Peruslinjat epävarmat" },
          { level: 2, title: "Kehittyvä", description: "Perusliike hallinnassa" },
          { level: 3, title: "Vahva", description: "Hyvä kontrolli ja tarkkuus" },
        ],
      },
      {
        id: "musicality",
        label: "Musikaalisuus",
        weight: 0.35,
        levels: [
          { level: 1, title: "Etsivä", description: "Rytmi katkeilee" },
          { level: 2, title: "Tasainen", description: "Musiikin tulkinta toimii" },
          { level: 3, title: "Ilmeikäs", description: "Vahva dynamiikka" },
        ],
      },
      {
        id: "expression",
        label: "Esiintyminen",
        weight: 0.25,
        levels: [
          { level: 1, title: "Varovainen", description: "Ilmaisussa puutteita" },
          { level: 2, title: "Vakuuttava", description: "Yleisökontakti säilyy" },
          { level: 3, title: "Kilpailuvalmis", description: "Vahva lavapresenssi" },
        ],
      },
    ],
  },
};

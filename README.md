# Taitoarvio Web App (MVP)

Moderni arviointi- ja tuomarointityökalu kahdella roolilla:
- **OPETTAJA / VALMENTAJA (Pro)**
- **OPPILAS (Free)**

## Arkkitehtuuri

Sovellus käyttää Next.js App Routeria. MVP on rakennettu sport-agnostic periaatteella:

- `src/domain/*` → puhdas arviointilogiikka (ranking + skating), testattava ilman UI:ta.
- `src/data/*` → repository-rajapinta ja localStorage-pohjainen toteutus.
- `src/features/judging/*` → UI + feature gating + roolipohjainen käytös.
- `app/(product)/app/page.tsx` → sisäänkäynti uuteen arviointinäkymään.

## Roolit ja feature gating

### Oppilas (Free)
- Näkee harjoitussessiot dashboardilla.
- Voi tehdä harjoitusarviointia luonnoksena.
- Voi kommentoida sessiota.
- Ei voi luoda sessioita tai lukita virallista sijoitusta.

### Valmentaja (Pro)
- Voi luoda uusia sessioita.
- Voi hallita workspacea ja yhteisvalmentajia.
- Voi lukita sijoitukset.
- Voi jakaa oppilaslinkin.

## Arviointimoodit

- **Syvä katsastelu (deep):** elementti + alakriteeri (1–6), tooltip-kuvaukset.
- **Nopea katsastelu (quick):** kevyempi syöttö samasta sport-konfiguraatiosta.

Sport-rubriikit tulevat datasta (`SportDefinition`). Ensimmäinen valmis sport on tanssi (vakio/latin).

## Yhteistuomarointi

Tuloksissa näytetään:
- yksittäisten valmentajien lukitut rankingit (seed-data)
- skating-perusteinen yhteistulos
- podium + taulukko

Skating-laskenta on eriytetty domain-funktioon: `calculateSkatingResults`.

## Kehitys

```bash
npm run dev
```

## Testit

```bash
npm run test:unit
```

Testit kattavat skating-laskennan ydintapaukset:
- majority-pohjainen järjestys
- tyhjän syötteen käsittely

## Jatkokehitysideoita

1. Pro-tier maksuseinä (Stripe) workspace- ja valmentajamäärärajoilla.
2. Session analytiikka: kehitystrendit parin ja kriteerin mukaan.
3. PDF/CSV-export + jaettava julkinen tulosnäkymä.
4. Video-integraatio (timecode-ankkuroidut kommentit).
5. Reaaliaikainen yhteistuomarointi WebSocket/CRDT-pohjalla.

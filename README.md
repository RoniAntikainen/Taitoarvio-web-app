## Taitoarvio Web App (MVP)

Moderni arviointi- ja tuomarointisovellus, jossa on kaksi roolia:
- **Valmentaja (Pro)**: hallitsee workspaceja, sessioita ja yhteistuomarointia.
- **Oppilas (Free)**: harjoittelee tuomarointia read-only aineistolla, tekee omia luonnoksia ja kommentoi.

## Arkkitehtuuri

Sovellus on toteutettu Next.js App Routerilla ja jaettu kerroksiin:

- `lib/domain/judging/*`: sport-agnostic domain-logiikka (rubriikit, ranking, aggregointi, skating).
- `lib/data/judging/*`: repository-rajapinta + localStorage implementaatio + demo seed.
- `lib/auth/permissions.ts`: roolien feature-gating.
- `lib/features/flags.ts`: ominaisuuksien togglet.
- `components/judging/*`: Apple-tyylinen UI (CSS Modules + tokenit).

### Sport-agnostic malli

`SportDefinition` määrittelee rubriikin datana (`rubric -> elements -> criteria`).
UI renderöi rubriikin konfiguraation perusteella, joten uuden lajin lisääminen tehdään lisäämällä sport-konfiguraatio.

### Arviointitavat

- **Deep**: elementti + alakriteeri + tasot 1–6, tasokuvaukset tooltip-teksteinä valinnoissa.
- **Quick**: kevyt pisteytys per pari (1–6).

### Yhteistuomarointi

Session judge-cardit yhdistetään domainin aggregointi- ja skating-funktioilla:
- yksittäisten tuomareiden sijoitukset
- yhteissijoitus enemmistölogiikalla
- podium + taulukko

## Roolioikeudet (feature gating)

- Oppilas (Free): `session.read`, `session.practice`, `comment.write`
- Valmentaja (Pro): kaikki yllä + `workspace.manage`, `session.create`, `session.lock`, `coach.invite`

## Kehitys

```bash
npm run dev
```

## Testit

Skating- ja aggregointilogiikan yksikkötestit:

```bash
npm run test
```

## Jatkokehitysideoita

1. Pro-tier maksullisuus (Stripe feature entitlements + workspace seat limits)
2. Sessio/analytiikka (coach benchmark, oppilaan kehityskäyrät)
3. Exportit (PDF, CSV, share snapshots)
4. Video-integraatio (timestamp-kommentit + side-by-side arviointi)
5. Reaaliaikainen yhteistuomarointi (WebSocket/CRDT)

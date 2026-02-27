"use client";

import React, { useEffect } from "react";

import { SPORT_CONFIG } from "@/lib/evaluation-config";
import { saveMySettings, type SaveSettingsState } from "@/app/actions/settings";
import SaveButton from "./SaveButton";

type Props = {
  initial: {
    defaultSportId: string;
    locale: string;
    timeZone: string;
    weekStartsOn: number;
    dateFormat: string;
    theme: "system" | "light" | "dark";
    reduceMotion: boolean;
    notificationsEmail: boolean;
    notificationsInApp: boolean;
    marketingConsent: boolean;
  };
};

const initialState: SaveSettingsState | null = null;

export default function SettingsForm({ initial }: Props) {
  // ✅ React 19 / Next 16 -yhteensopiva:
  // useFormState -> useActionState
  const [state, formAction] = React.useActionState(saveMySettings, initialState);

  useEffect(() => {
    if (!state?.ok) return;
    const el = document.getElementById("settingsFlash");
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state]);

  return (
    <form action={formAction} className="settingsForm" noValidate>
      <div id="settingsFlash" />

      {state ? (
        <div className={state.ok ? "settingsFlash settingsFlash--ok" : "settingsFlash settingsFlash--err"}>
          {state.message}
        </div>
      ) : null}

      <section className="settingsCard">
        <header className="settingsCard__head">
          <h2 className="settingsCard__title">Sovelluksen oletukset</h2>
          <p className="settingsCard__sub">Nämä asetukset vaikuttavat uusiin arvioihin, oppilaisiin ja näkymiin.</p>
        </header>

        <div className="settingsGrid">
          <div className="settingsField">
            <label className="settingsLabel" htmlFor="defaultSportId">
              Oletuslaji
            </label>
            <select
              id="defaultSportId"
              name="defaultSportId"
              className="settingsControl"
              defaultValue={initial.defaultSportId}
            >
              {SPORT_CONFIG.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {state && !state.ok && state.fieldErrors?.defaultSportId ? <div className="settingsError">{state.fieldErrors.defaultSportId}</div> : null}
          </div>

          <div className="settingsField">
            <label className="settingsLabel" htmlFor="theme">
              Teema
            </label>
            <select id="theme" name="theme" className="settingsControl" defaultValue={initial.theme}>
              <option value="system">Järjestelmä</option>
              <option value="light">Vaalea</option>
              <option value="dark">Tumma</option>
            </select>
          </div>

          <div className="settingsField">
            <label className="settingsLabel" htmlFor="locale">
              Kieli / locale
            </label>
            <input
              id="locale"
              name="locale"
              className="settingsControl"
              defaultValue={initial.locale}
              placeholder="fi"
              autoComplete="language"
            />
          </div>

          <div className="settingsField">
            <label className="settingsLabel" htmlFor="timeZone">
              Aikavyöhyke
            </label>
            <input
              id="timeZone"
              name="timeZone"
              className="settingsControl"
              defaultValue={initial.timeZone}
              placeholder="Europe/Helsinki"
              autoComplete="off"
            />
          </div>

          <div className="settingsField">
            <label className="settingsLabel" htmlFor="weekStartsOn">
              Viikko alkaa
            </label>
            <select id="weekStartsOn" name="weekStartsOn" className="settingsControl" defaultValue={String(initial.weekStartsOn)}>
              <option value="1">Maanantai</option>
              <option value="0">Sunnuntai</option>
            </select>
          </div>

          <div className="settingsField">
            <label className="settingsLabel" htmlFor="dateFormat">
              Päivämääräformaatti
            </label>
            <input
              id="dateFormat"
              name="dateFormat"
              className="settingsControl"
              defaultValue={initial.dateFormat}
              placeholder="yyyy-MM-dd"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="settingsRow">
          <label className="settingsCheck">
            <input type="checkbox" name="reduceMotion" defaultChecked={initial.reduceMotion} />
            <span>Vähennä animaatioita (reduce motion)</span>
          </label>
        </div>
      </section>

      <section className="settingsCard">
        <header className="settingsCard__head">
          <h2 className="settingsCard__title">Ilmoitukset</h2>
          <p className="settingsCard__sub">Valitse miten haluat vastaanottaa päivityksiä.</p>
        </header>

        <div className="settingsRow">
          <label className="settingsCheck">
            <input type="checkbox" name="notificationsInApp" defaultChecked={initial.notificationsInApp} />
            <span>Sovelluksen sisäiset ilmoitukset</span>
          </label>
        </div>

        <div className="settingsRow">
          <label className="settingsCheck">
            <input type="checkbox" name="notificationsEmail" defaultChecked={initial.notificationsEmail} />
            <span>Sähköposti-ilmoitukset</span>
          </label>
        </div>
      </section>

      <section className="settingsCard">
        <header className="settingsCard__head">
          <h2 className="settingsCard__title">Tietosuoja</h2>
          <p className="settingsCard__sub">Hallinnoi markkinointiviestintää.</p>
        </header>

        <div className="settingsRow">
          <label className="settingsCheck">
            <input type="checkbox" name="marketingConsent" defaultChecked={initial.marketingConsent} />
            <span>Sallin markkinointiviestit (voit perua milloin vain)</span>
          </label>
        </div>
      </section>

      <div className="settingsActions">
        <SaveButton label="Tallenna asetukset" />
      </div>
    </form>
  );
}
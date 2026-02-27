"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./JudgingApp.module.css";
import { localStorageRepository } from "@/lib/data/judging/localStorageRepository";
import { computeDeepTotals, computeSkating, rankByScore } from "@/lib/domain/judging/scoring";
import { getSportDefinition } from "@/lib/domain/judging/sports";
import { ReviewDraft, Role, Session } from "@/lib/domain/judging/types";
import { can } from "@/lib/auth/permissions";

const tabs = ["Asetukset", "Arviointi", "Tulokset", "Kommentit"] as const;

export function JudgingApp() {
  const [role, setRole] = useState<Role>("coach");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Arviointi");
  const [draft, setDraft] = useState<ReviewDraft>();

  useEffect(() => {
    (async () => {
      const user = await localStorageRepository.getCurrentUser();
      const loadedSessions = await localStorageRepository.listSessions();
      setRole(user.role);
      setSessions(loadedSessions);
      setSelectedSessionId(loadedSessions[0]?.id ?? "");
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedSessionId) return;
      const user = await localStorageRepository.getCurrentUser();
      const existingDraft = await localStorageRepository.getDraft(selectedSessionId, user.id);
      if (existingDraft) {
        setDraft(existingDraft);
      } else {
        const session = sessions.find((item) => item.id === selectedSessionId);
        if (!session) return;
        setDraft({
          sessionId: session.id,
          authorId: user.id,
          role: user.role,
          mode: session.mode,
          deepEntries: [],
          quickScores: {},
          notesByCompetitor: {},
          locked: false,
        });
      }
    })();
  }, [selectedSessionId, sessions]);

  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const sport = selectedSession ? getSportDefinition(selectedSession.sportId) : undefined;

  const ranking = useMemo(() => {
    if (!draft || !selectedSession) return [];
    const scores = draft.mode === "deep" ? computeDeepTotals(draft) : draft.quickScores;
    return rankByScore(scores).map((id, idx) => ({ id, rank: idx + 1 }));
  }, [draft, selectedSession]);

  const skating = useMemo(() => {
    if (!selectedSession) return [];
    return computeSkating(selectedSession);
  }, [selectedSession]);

  const progress = useMemo(() => {
    if (!selectedSession || !sport || !draft) return 0;
    if (draft.mode === "quick") {
      const total = selectedSession.competitors.length;
      return Math.round((Object.keys(draft.quickScores).length / Math.max(total, 1)) * 100);
    }

    const total = selectedSession.competitors.length * sport.rubric.flatMap((item) => item.criteria).length;
    return Math.round((draft.deepEntries.length / Math.max(total, 1)) * 100);
  }, [draft, selectedSession, sport]);

  const persistDraft = async (nextDraft: ReviewDraft) => {
    setDraft(nextDraft);
    await localStorageRepository.saveDraft(nextDraft);
  };

  if (!selectedSession || !sport || !draft) return null;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <h1>Arviointikeskus</h1>
          <p>Sport-agnostic arviointimoottori: Pro-valmentaja + Free-oppilas.</p>
        </div>
        <label className={styles.roleSwitch}>
          <span>Rooli</span>
          <select
            value={role}
            onChange={async (event) => {
              const nextRole = event.target.value as Role;
              setRole(nextRole);
              await localStorageRepository.setCurrentRole(nextRole);
            }}
            aria-label="Valitse rooli"
          >
            <option value="coach">Valmentaja (Pro)</option>
            <option value="student">Oppilas (Free)</option>
          </select>
        </label>
      </header>

      <section className={styles.dashboard}>
        <article className={styles.card}>
          <h2>{role === "coach" ? "Omat kansiot" : "Harjoituskisat"}</h2>
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                <button className={styles.sessionButton} onClick={() => setSelectedSessionId(session.id)}>
                  <strong>{session.title}</strong>
                  <span>{session.roundName} · {session.heatName}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h2>{role === "coach" ? "Luo uusi sessio" : "Jatka harjoitusta"}</h2>
          <p>
            {can(role, "session.create")
              ? "Pro-käyttäjä voi luoda sessioita, hallita workspacea ja kutsua valmentajia yhteistuomarointiin."
              : "Free-käyttäjä voi tehdä omaa harjoitusarviointia katsojamoodissa ja kommentoida."}
          </p>
          <div className={styles.pillRow}>
            <span className={styles.pill}>Laji: {sport.label}</span>
            <span className={styles.pill}>Moodi: {selectedSession.mode === "deep" ? "Syvä katsastelu" : "Nopea katsastelu"}</span>
            <span className={styles.pill}>Progress: {progress}%</span>
          </div>
        </article>
      </section>

      <section className={styles.card}>
        <div className={styles.sessionHeader}>
          <div>
            <h2>{selectedSession.title}</h2>
            <p>{sport.label} · {selectedSession.roundName} · {selectedSession.heatName}</p>
          </div>
          <div className={styles.tabRow} role="tablist" aria-label="Sessiotabit">
            {tabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Asetukset" && (
          <div className={styles.settingsGrid}>
            <div>
              <h3>Workspace</h3>
              <p>Monivalmentajatuki aktiivinen. Tuomarikortit lukitaan erikseen per valmentaja.</p>
            </div>
            <div>
              <h3>Oikeudet</h3>
              <p>{can(role, "coach.invite") ? "Voit kutsua valmentajia." : "Vain valmentaja voi kutsua muita."}</p>
            </div>
          </div>
        )}

        {activeTab === "Arviointi" && (
          <div className={styles.evaluationLayout}>
            <aside className={styles.competitorList}>
              {selectedSession.competitors.map((competitor) => (
                <div key={competitor.id} className={styles.competitorItem}>
                  <strong>{competitor.name}</strong>
                  <span>{competitor.club ?? "—"}</span>
                </div>
              ))}
            </aside>
            <div className={styles.rubricPane}>
              {draft.mode === "deep" ? (
                sport.rubric.map((element) => (
                  <details key={element.id} className={styles.accordion} open>
                    <summary>{element.label}</summary>
                    {element.criteria.map((criterion) => (
                      <div key={criterion.id} className={styles.criterionRow}>
                        <label>{criterion.label}</label>
                        <select
                          aria-label={criterion.label}
                          disabled={!can(role, "session.lock")}
                          onChange={(event) => {
                            const score = Number(event.target.value);
                            const competitor = selectedSession.competitors[0]?.id;
                            if (!competitor) return;
                            const filtered = draft.deepEntries.filter((entry) => !(entry.competitorId === competitor && entry.criterionId === criterion.id));
                            void persistDraft({
                              ...draft,
                              deepEntries: [...filtered, { competitorId: competitor, elementId: element.id, criterionId: criterion.id, score }],
                            });
                          }}
                        >
                          <option value="">Valitse 1–6</option>
                          {[1, 2, 3, 4, 5, 6].map((level) => (
                            <option key={level} value={level}>
                              {level} — {criterion.levelDescriptions[level]}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </details>
                ))
              ) : (
                <div>
                  <h3>Nopea katsastelu</h3>
                  {selectedSession.competitors.map((competitor) => (
                    <div key={competitor.id} className={styles.criterionRow}>
                      <label>{competitor.name}</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        disabled={!can(role, "session.lock")}
                        value={draft.quickScores[competitor.id] ?? ""}
                        onChange={(event) =>
                          void persistDraft({
                            ...draft,
                            quickScores: {
                              ...draft.quickScores,
                              [competitor.id]: Number(event.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                className={styles.primaryButton}
                disabled={!can(role, "session.lock")}
                onClick={() => void persistDraft({ ...draft, locked: true })}
              >
                Lukitse arviointi
              </button>
            </div>
          </div>
        )}

        {activeTab === "Tulokset" && (
          <div className={styles.resultsGrid}>
            <div>
              <h3>Top-3 podium</h3>
              <ol>
                {skating.slice(0, 3).map((row) => (
                  <li key={row.competitorId}>{row.place}. {selectedSession.competitors.find((c) => c.id === row.competitorId)?.name}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3>Skating-taulukko</h3>
              <table className={styles.table}>
                <thead><tr><th>Pari</th><th>Sijoitus</th><th>Majority @1</th></tr></thead>
                <tbody>
                  {skating.map((row) => (
                    <tr key={row.competitorId}><td>{selectedSession.competitors.find((c) => c.id === row.competitorId)?.name}</td><td>{row.place}</td><td>{row.majorityByPlace[1]}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3>Oma ranking</h3>
              <ol>
                {ranking.map((row) => (
                  <li key={row.id}>{row.rank}. {selectedSession.competitors.find((c) => c.id === row.id)?.name}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === "Kommentit" && (
          <div className={styles.commentPanel}>
            <ul>
              {selectedSession.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.author}</strong>: {comment.message}
                </li>
              ))}
            </ul>
            <textarea placeholder="Kirjoita kommentti..." aria-label="Kommentti" />
            <button className={styles.primaryButton}>Lähetä</button>
          </div>
        )}
      </section>
    </div>
  );
}

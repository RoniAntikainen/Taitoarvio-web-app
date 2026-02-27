"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./JudgingWorkspaceApp.module.css";
import { createLocalStorageRepository } from "@/src/data/localStorageRepository";
import { SPORTS } from "@/src/data/seed";
import { LockedRanking, Role } from "@/src/domain/models";
import { calculateSkatingResults } from "@/src/domain/skating";
import { canComment, canCreateSession, canManageWorkspace } from "./access";

const repository = createLocalStorageRepository();

type MainTab = "dashboard" | "session";
type SessionTab = "settings" | "assessment" | "results" | "comments";

const roleLabels: Record<Role, string> = {
  coach: "OPETTAJA / VALMENTAJA (Pro)",
  student: "OPPILAS (Free)",
};

export default function JudgingWorkspaceApp() {
  const [role, setRole] = useState<Role>("coach");
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [sessionTab, setSessionTab] = useState<SessionTab>("assessment");
  const [mode, setMode] = useState<"deep" | "quick">("deep");
  const [selectedSessionId] = useState("s1");
  const [selectedCoupleId, setSelectedCoupleId] = useState("c1");
  const [commentText, setCommentText] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [lockedRankings, setLockedRankings] = useState<LockedRanking[]>([]);

  const sport = SPORTS[0];
  const rubric = mode === "deep" ? sport.deepRubric : sport.quickRubric;

  useEffect(() => {
    repository.listLockedRankings(selectedSessionId).then(setLockedRankings);
  }, [selectedSessionId]);

  async function handleCommentSubmit() {
    if (!canComment(role) || !commentText.trim()) return;
    await repository.saveComment(selectedSessionId, {
      id: crypto.randomUUID(),
      author: role === "coach" ? "Valmentaja" : "Oppilas",
      createdAt: new Date().toISOString(),
      message: commentText,
      role,
      target: "session",
      targetId: selectedSessionId,
    });
    setCommentText("");
  }

  function updateCriterionScore(criterionId: string, value: number) {
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  }

  const progress = useMemo(() => {
    const total = rubric.flatMap((item) => item.criteria).length;
    const done = Object.keys(scores).length;
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [rubric, scores]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Taitoarvio Next MVP</p>
          <h1>Sport-agnostic arviointityökalu</h1>
        </div>
        <div className={styles.roleSwitch}>
          {(["coach", "student"] as Role[]).map((item) => (
            <button key={item} className={item === role ? styles.roleActive : styles.roleButton} onClick={() => setRole(item)}>
              {roleLabels[item]}
            </button>
          ))}
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Päänavigaatio">
        <button onClick={() => setMainTab("dashboard")} className={mainTab === "dashboard" ? styles.tabActive : styles.tabButton}>Dashboard</button>
        <button onClick={() => setMainTab("session")} className={mainTab === "session" ? styles.tabActive : styles.tabButton}>Sessio</button>
      </nav>

      {mainTab === "dashboard" ? (
        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>{role === "coach" ? "Omat kansiot" : "Harjoituskisat"}</h2>
            <p>{role === "coach" ? "Luo sessioita, lisää valmentajia ja jaa oppilaslinkit." : "Näe valmiit harjoituskisat ja jatka omia luonnoksia."}</p>
          </article>
          <article className={styles.card}>
            <h2>{role === "coach" ? "Kutsut & linkit" : "Kommentit"}</h2>
            <p>{role === "coach" ? "Hallinnoi yhteistuomaroinnin osallistujia." : "Kommentoi paria tai kriteeriä harjoitustilassa."}</p>
            <button className={styles.primary} disabled={!canCreateSession(role)}>
              {canCreateSession(role) ? "Luo uusi sessio" : "Vain Pro-roolille"}
            </button>
          </article>
        </section>
      ) : (
        <section className={styles.card}>
          <div className={styles.sessionHead}>
            <div>
              <h2>Harjoituskisa #1 · {sport.name}</h2>
              <p>{sport.discipline} · Semifinaali · Erä A</p>
            </div>
            <div className={styles.modeToggle}>
              <button className={mode === "deep" ? styles.tabActive : styles.tabButton} onClick={() => setMode("deep")}>Syvä katsastelu</button>
              <button className={mode === "quick" ? styles.tabActive : styles.tabButton} onClick={() => setMode("quick")}>Nopea katsastelu</button>
            </div>
          </div>

          <nav className={styles.tabs}>
            {(["settings", "assessment", "results", "comments"] as SessionTab[]).map((tab) => (
              <button key={tab} onClick={() => setSessionTab(tab)} className={sessionTab === tab ? styles.tabActive : styles.tabButton}>{tab}</button>
            ))}
          </nav>

          {sessionTab === "settings" && (
            <div className={styles.grid}>
              <div className={styles.subCard}>
                <h3>Asetukset</h3>
                <p>Sport-rubriikki renderöityy datasta. Backend voidaan vaihtaa repository-rajapinnan taakse.</p>
              </div>
              <div className={styles.subCard}>
                <h3>Workspace-oikeudet</h3>
                <p>{canManageWorkspace(role) ? "Voit lisätä valmentajia ja jakaa linkin oppilaille." : "Read-only oikeudet. Et voi muokata sessiota."}</p>
              </div>
            </div>
          )}

          {sessionTab === "assessment" && (
            <div className={styles.assessmentLayout}>
              <aside className={styles.sidebar}>
                <input className={styles.input} placeholder="Hae paria" aria-label="Hae paria" />
                {["c1", "c2", "c3", "c4"].map((couple) => (
                  <button key={couple} className={selectedCoupleId === couple ? styles.listActive : styles.listItem} onClick={() => setSelectedCoupleId(couple)}>
                    {couple}
                  </button>
                ))}
              </aside>
              <div className={styles.assessmentPanel}>
                <p className={styles.progress}>Edistyminen {progress.done}/{progress.total} ({progress.percent}%)</p>
                {rubric.map((element) => (
                  <section key={element.id} className={styles.subCard}>
                    <h3>{element.label}</h3>
                    {element.criteria.map((criterion) => (
                      <label key={criterion.id} className={styles.scoreRow}>
                        <span title={criterion.description}>{criterion.label}</span>
                        <select className={styles.select} value={scores[criterion.id] ?? ""} onChange={(event) => updateCriterionScore(criterion.id, Number(event.target.value))}>
                          <option value="">Valitse 1–6</option>
                          {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                      </label>
                    ))}
                  </section>
                ))}
                <button className={styles.primary} disabled={role === "student"}>Lukitse sijoitukset</button>
                {role === "student" && <p className={styles.muted}>Oppilas voi vain harjoitella luonnoksissa.</p>}
              </div>
            </div>
          )}

          {sessionTab === "results" && <ResultsPanel rankings={lockedRankings} />}

          {sessionTab === "comments" && (
            <div className={styles.subCard}>
              <h3>Kommentit</h3>
              <p>Kommentointi sallittu molemmille rooleille.</p>
              <textarea className={styles.textarea} value={commentText} onChange={(event) => setCommentText(event.target.value)} />
              <button className={styles.primary} onClick={handleCommentSubmit}>Lisää kommentti</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ResultsPanel({ rankings }: { rankings: LockedRanking[] }) {
  const result = calculateSkatingResults(rankings);

  return (
    <div className={styles.grid}>
      <div className={styles.subCard}>
        <h3>Podium</h3>
        <ol>{result.slice(0, 3).map((item) => <li key={item.coupleId}>{item.finalRank}. {item.coupleId}</li>)}</ol>
      </div>
      <div className={styles.subCard}>
        <h3>Skating-taulukko</h3>
        <table className={styles.table}>
          <thead><tr><th>Pari</th><th>1.sijat</th><th>Rank-pisteet</th><th>Sijoitus</th></tr></thead>
          <tbody>
            {result.map((item) => <tr key={item.coupleId}><td>{item.coupleId}</td><td>{item.firstPlaces}</td><td>{item.totalRankPoints}</td><td>{item.finalRank}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

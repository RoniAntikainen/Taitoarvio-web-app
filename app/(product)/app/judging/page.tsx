import ProFeatureGate from "@/components/ui/ProFeatureGate";
import { averageRubricScore, combinePlacements } from "@/domain/skating";
import { getRoleLabel, roleBadgeTone } from "@/features/auth/roles";
import { SPORT_RUBRICS } from "@/features/judging/config/sports";
import {
  demoComments,
  demoEvaluation,
  demoFolder,
  demoMemberships,
  judgeResults,
  participantLabels,
} from "@/features/judging/mock/scenario";
import { inviteCoach } from "@/features/judging/services/judging-service";
import "./judging.css";

export default async function JudgingTrainingPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: "student" | "coach" }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const role = sp?.role === "student" ? "student" : "coach";
  const ranking = combinePlacements(judgeResults);
  const avgScores = averageRubricScore(judgeResults);
  const rubric = SPORT_RUBRICS[demoEvaluation.sportId];
  const invited = role === "coach"
    ? inviteCoach(demoMemberships, demoFolder.id, "coach-a", "coach-c")
    : demoMemberships;

  return (
    <div className="judgingPage">
      <header className="judgingHeader">
        <div>
          <h1>Harjoittelu (Tuomarointi)</h1>
          <p>Pystyviipale: kansio → valmentajakutsu → kisa → arviointi → yhteistulos → oppilaskommentit.</p>
        </div>
        <span className={roleBadgeTone(role)}>{getRoleLabel(role)}</span>
      </header>

      <section className="stepper" aria-label="Arvioinnin vaiheet">
        <span>1. Setup</span>
        <span>2. Arviointi</span>
        <span>3. Tulokset</span>
      </section>

      <section className="cardGrid">
        <article className="card">
          <h2>Setup</h2>
          <p>Kansio: {demoFolder.name}</p>
          <p>Kutsutut valmentajat: {invited.filter((m) => m.role === "coach").length}</p>
          <p>Kisa: {demoEvaluation.title}</p>
          <p>Laji: {demoEvaluation.sportId}</p>
          <ProFeatureGate allowed={role === "coach"} label="Luo uusi kilpailu" />
        </article>

        <article className="card">
          <h2>Arviointi</h2>
          <p>Moodi: Syvä katsastelu (rubric)</p>
          <ul>
            {rubric.criteria.map((criterion) => (
              <li key={criterion.id}>
                {criterion.label} ({Math.round(criterion.weight * 100)}%)
              </li>
            ))}
          </ul>
          <ProFeatureGate allowed={role === "coach"} label="Tallenna arviointi" />
        </article>
      </section>

      <section className="card">
        <h2>Tulokset (yhteistulos / skating-tyyppi)</h2>
        <table>
          <thead>
            <tr>
              <th>Kilpailija</th>
              <th>1. sijan äänet</th>
              <th>Keskiarvosija</th>
              <th>Lopullinen sijoitus</th>
              <th>Rubric keskiarvo</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row) => (
              <tr key={row.participantId} className={row.finalPlace <= 3 ? "top3" : ""}>
                <td>{participantLabels[row.participantId]}</td>
                <td>{row.firstPlaceVotes}</td>
                <td>{row.averagePlace.toFixed(2)}</td>
                <td>{row.finalPlace}</td>
                <td>{avgScores[row.participantId]?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Oppilaan näkymä: kommentointi sallittu, luonti lukittu</h2>
        <div className="commentList">
          {demoComments.map((comment) => (
            <article key={comment.id}>
              <strong>{comment.authorId}</strong>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

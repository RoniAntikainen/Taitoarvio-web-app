import Link from "next/link";
import { listJudgingEvaluations, listJudgingFolders } from "@/app/actions/judging";
import "./evaluations.css";

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ folderId?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const folders = await listJudgingFolders();
  const folderId = sp?.folderId ?? folders[0]?.id;
  const evaluations = folderId ? await listJudgingEvaluations(folderId) : [];

  return (
    <div className="evaluationsPage">
      <header>
        <h1>Arvioinnit</h1>
        <p>Kilpailu-, harjoitus- ja videosuoritusten arvioinnit samoissa kansioissa.</p>
      </header>

      <div className="folderFilter">
        {folders.map((folder) => (
          <Link key={folder.id} href={`/app/evaluations?folderId=${folder.id}`}>
            {folder.name}
          </Link>
        ))}
      </div>

      {evaluations.length === 0 ? (
        <article className="evalCard">
          <h2>Ei arviointeja vielä</h2>
          <p>Luo ensimmäinen arviointi Harjoittelu-sivulla.</p>
          <Link href={folderId ? `/app/judging?folderId=${folderId}` : "/app/judging"}>Avaa Harjoittelu</Link>
        </article>
      ) : (
        evaluations.map((evaluation) => (
          <article key={evaluation.id} className="evalCard">
            <h2>{evaluation.subject}</h2>
            <p>Moodi: {evaluation.payload.mode === "deep" ? "Syvä" : "Kevyt"}</p>
            <p>Kilpailijoita: {evaluation.payload.participants.length}</p>
            <p>Tuomareita: {Object.keys(evaluation.payload.judgeResults).length}</p>
            <Link href={`/app/judging?folderId=${evaluation.folderId}&evaluationId=${evaluation.id}`}>
              Avaa arviointi
            </Link>
          </article>
        ))
      )}
    </div>
  );
}

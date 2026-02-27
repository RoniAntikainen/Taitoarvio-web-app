import Link from "next/link";
import { demoEvaluation, demoFolder } from "@/features/judging/mock/scenario";
import "./evaluations.css";

export default function EvaluationsPage() {
  return (
    <div className="evaluationsPage">
      <header>
        <h1>Arvioinnit</h1>
        <p>Yhdistetty näkymä kilpailu-, harjoitus- ja videosuoritusten arviointeihin.</p>
      </header>

      <article className="evalCard">
        <h2>{demoEvaluation.title}</h2>
        <p>Kansio: {demoFolder.name}</p>
        <p>Moodi: {demoEvaluation.mode === "deep" ? "Syvä" : "Kevyt"}</p>
        <Link href="/app/judging">Avaa arviointi</Link>
      </article>
    </div>
  );
}

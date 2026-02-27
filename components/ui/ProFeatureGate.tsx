import type { ReactNode } from "react";

type ProFeatureGateProps = {
  allowed: boolean;
  label: string;
  children?: ReactNode;
};

export default function ProFeatureGate({ allowed, label, children }: ProFeatureGateProps) {
  if (allowed) return children ? <>{children}</> : null;

  return (
    <button type="button" className="proLock" disabled title="Pro-ominaisuus — päivitä valmentajaksi">
      <span>{label}</span>
      <span className="proPill">Pro-ominaisuus</span>
    </button>
  );
}

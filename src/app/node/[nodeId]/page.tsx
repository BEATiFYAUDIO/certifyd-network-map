import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricRow, StatusBadge } from "@/components/StatusBadge";
import { ProviderCopyPanel } from "@/components/ProviderCopyPanel";
import { contentboxNetworkSettingsUrl, getNetworkNode, reasonLabel } from "@/lib/network";

function HistoryValue({ label, value, suffix = "" }: { label: string; value?: number | null; suffix?: string }) {
  if (value == null) return null;
  return (
    <div className="historyItem">
      <span>{label}</span>
      <strong>{value.toLocaleString()}{suffix}</strong>
    </div>
  );
}

export default async function NodeDetail({ params }: { params: Promise<{ nodeId: string }> }) {
  const resolvedParams = await params;
  const nodeId = decodeURIComponent(resolvedParams.nodeId);
  const node = await getNetworkNode(nodeId).catch(() => null);
  if (!node) notFound();
  const reasonCodes = Array.from(
    new Set(
      [node.services.commerce, node.services.settlement, node.readiness.provisioned, node.readiness.durable].flatMap(
        (metric) => metric.reasonCodes || []
      )
    )
  );

  return (
    <main className="shell detailShell">
      <Link className="backLink" href="/">Back to Network Map</Link>

      <section className="detailHero panel">
        <div>
          <p className="eyebrow">Sovereign Provider</p>
          <h1>{node.displayName}</h1>
          {node.operator ? <p className="muted">Operator: {node.operator}</p> : null}
          <div className="roleList">{node.roles.map((role) => <span key={role}>{role}</span>)}</div>
        </div>
        <StatusBadge status={node.overallStatus} />
      </section>

      <section className="detailGrid">
        <div className="panel">
          <p className="eyebrow">Services</p>
          <MetricRow label="Identity" metric={node.services.identity} />
          <MetricRow label="Content" metric={node.services.content} />
          <MetricRow label="Commerce" metric={node.services.commerce} />
          <MetricRow label="Settlement" metric={node.services.settlement} />
          <MetricRow label="Proofs" metric={node.services.proofs} />
        </div>
        <div className="panel">
          <p className="eyebrow">Readiness</p>
          <MetricRow label="Provisioned" metric={node.readiness.provisioned} />
          <MetricRow label="Durable" metric={node.readiness.durable} />
          <MetricRow label="Reachable" metric={node.readiness.reachable} />
        </div>
      </section>

      <section className="detailGrid">
        <div className="panel trustPanel">
          <p className="eyebrow">Trust</p>
          <div className="trustList">
            <span>Operator Verified <strong>{node.trust.operatorVerified ? "Yes" : "No"}</strong></span>
            <span>Proof Capable <strong>{node.trust.proofCapable ? "Yes" : "No"}</strong></span>
            {typeof node.trust.proofCount === "number" ? <span>Proof Count <strong>{node.trust.proofCount}</strong></span> : null}
            {typeof node.trust.trustScore === "number" ? <span>Trust Score <strong>{node.trust.trustScore}</strong></span> : null}
          </div>
        </div>
        <div className="panel trustPanel">
          <p className="eyebrow">History</p>
          <div className="historyGrid">
            <HistoryValue label="Node Age" value={node.history?.nodeAgeDays} suffix=" days" />
            <HistoryValue label="Reliability 30d" value={node.history?.reliability30d} suffix="%" />
            <HistoryValue label="Reliability 90d" value={node.history?.reliability90d} suffix="%" />
            <HistoryValue label="Successful Payments 30d" value={node.history?.successfulPayments30d} />
          </div>
        </div>
      </section>

      {reasonCodes.length ? (
        <section className="panel">
          <p className="eyebrow">Public Status Notes</p>
          <div className="reasonCloud">
            {reasonCodes.map((reason) => <span key={reason}>{reasonLabel(reason)}</span>)}
          </div>
        </section>
      ) : null}

      <ProviderCopyPanel node={node} settingsUrl={contentboxNetworkSettingsUrl()} />
    </main>
  );
}

import Link from "next/link";
import { StatusBadge, MetricRow } from "@/components/StatusBadge";
import { getNodeEligibilityReasons, isProvisionableNode, type NetworkMapNode } from "@/lib/network";

export function NodeCard({ node }: { node: NetworkMapNode }) {
  const provisionable = isProvisionableNode(node);
  const eligibilityReasons = getNodeEligibilityReasons(node);
  const proofLabel = node.trust.proofCapable ? "Proof capable" : "Proof pending";

  return (
    <article className="nodeCard">
      <div className="nodeCardTop">
        <div>
          <p className="eyebrow">Sovereign Node</p>
          <h2>{node.displayName}</h2>
          {node.operator ? <p className="muted">Operator: {node.operator}</p> : null}
        </div>
        <StatusBadge status={node.overallStatus} />
      </div>

      <div className="roleList" aria-label="Node roles">
        {node.roles.map((role) => (
          <span key={role}>{role}</span>
        ))}
      </div>

      <div className="nodeSignals" aria-label="Provider trust signals">
        <span>{provisionable ? "Provisionable" : "Not provisionable"}</span>
        <span>{proofLabel}</span>
        {typeof node.trust.trustScore === "number" ? <span>Trust {node.trust.trustScore}</span> : null}
      </div>

      <div className="compactMetrics">
        <MetricRow label="Commerce" metric={node.services.commerce} />
        <MetricRow label="Settlement" metric={node.services.settlement} />
        <MetricRow label="Provisioned" metric={node.readiness.provisioned} />
        <MetricRow label="Reachable" metric={node.readiness.reachable} />
      </div>

      {!provisionable && eligibilityReasons.length ? (
        <p className="metricReason">{eligibilityReasons.join(", ")}</p>
      ) : null}

      <Link className="cardLink" href={`/node/${encodeURIComponent(node.nodeId)}`}>
        Review provider details
      </Link>
    </article>
  );
}

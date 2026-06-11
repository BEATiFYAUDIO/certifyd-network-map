import { reasonLabel, statusLabel, type NetworkMapMetric, type NetworkMapStatus } from "@/lib/network";

export function StatusBadge({ status }: { status: NetworkMapStatus }) {
  return <span className={`statusBadge status-${status}`}>{statusLabel(status)}</span>;
}

export function MetricRow({ label, metric }: { label: string; metric: NetworkMapMetric }) {
  return (
    <div className="metricRow">
      <div>
        <div className="metricLabel">{label}</div>
        {metric.reasonCodes?.length ? (
          <div className="metricReason">{metric.reasonCodes.map(reasonLabel).join(", ")}</div>
        ) : metric.message ? (
          <div className="metricReason">{metric.message}</div>
        ) : null}
      </div>
      <div className="metricValue">
        {typeof metric.score === "number" ? <span className="score">{metric.score}</span> : null}
        <StatusBadge status={metric.status} />
      </div>
    </div>
  );
}

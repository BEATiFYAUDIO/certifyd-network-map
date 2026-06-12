"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { MetricRow, StatusBadge } from "@/components/StatusBadge";
import {
  getNodeEligibilityReasons,
  isMapEligibleNode,
  isProvisionableNode,
  type NetworkMapNode
} from "@/lib/network";

type NodesResponse = {
  items?: NetworkMapNode[];
};

type CheckState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; providerUrl: string }
  | { status: "result"; node: NetworkMapNode; providerUrl: string; sourceCount: number };

const capabilityLabels: Array<[keyof NetworkMapNode["connect"]["capabilities"], string]> = [
  ["identity", "Identity service"],
  ["content", "Content service"],
  ["commerce", "Commerce service"],
  ["settlement", "Settlement service"],
  ["proofs", "Proof service"]
];

function normalizeProviderUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Enter a provider URL.");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString().replace(/\/$/, "");
}

function sameProviderUrl(left: string, right: string): boolean {
  try {
    return normalizeProviderUrl(left).toLowerCase() === normalizeProviderUrl(right).toLowerCase();
  } catch {
    return left.replace(/\/$/, "").toLowerCase() === right.replace(/\/$/, "").toLowerCase();
  }
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  return (
    <button
      className="copyButton"
      type="button"
      disabled={!value}
      onClick={async () => {
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          setState("copied");
        } catch {
          setState("failed");
        }
        window.setTimeout(() => setState("idle"), 1500);
      }}
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </button>
  );
}

function RequirementList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="joinCard">
      <h2>{title}</h2>
      <ul className="checkList">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ProviderDetails({ node }: { node: NetworkMapNode }) {
  const details = [
    `Provider URL: ${node.connect.providerCanonicalUrl || ""}`,
    `Provider Node ID: ${node.connect.providerNodeId || ""}`,
    `Provider Public Key: ${node.connect.providerPublicKey || ""}`,
    `Provider Profile ID: ${node.connect.providerProfileId || ""}`
  ].join("\n");

  return (
    <div className="joinDetails">
      <div><span>Node name</span><strong>{node.displayName}</strong></div>
      <div><span>Provider URL</span><code>{node.connect.providerCanonicalUrl || "Not available"}</code></div>
      <div><span>Provider Node ID</span><code>{node.connect.providerNodeId || "Not available"}</code></div>
      <div><span>Provider Public Key</span><code>{node.connect.providerPublicKey || "Not available"}</code></div>
      <div><span>Services</span><strong>{node.roles.join(", ") || "Not available"}</strong></div>
      <CopyButton label="Copy provider details" value={details} />
    </div>
  );
}

function ResultPanel({ node, providerUrl, sourceCount }: { node: NetworkMapNode; providerUrl: string; sourceCount: number }) {
  const mapEligible = isMapEligibleNode(node);
  const provisionable = isProvisionableNode(node);
  const reasons = getNodeEligibilityReasons(node);
  const statusTitle = provisionable
    ? "Your node is provisionable."
    : mapEligible
      ? "Your node is visible but not fully provisionable yet."
      : "Your node is not map-eligible yet.";
  const requestHref = `mailto:network@certifyd.me?subject=${encodeURIComponent("Certifyd Network listing request")}&body=${encodeURIComponent(
    [
      "Please review this node for Certifyd Network listing:",
      "",
      `Provider URL: ${node.connect.providerCanonicalUrl || providerUrl}`,
      `Provider Node ID: ${node.connect.providerNodeId || ""}`,
      `Provider Public Key: ${node.connect.providerPublicKey || ""}`
    ].join("\n")
  )}`;

  return (
    <section className={`panel eligibilityResult ${provisionable ? "resultReady" : mapEligible ? "resultLimited" : "resultBlocked"}`} aria-live="polite">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Eligibility Result</p>
          <h2>{statusTitle}</h2>
          <p className="muted">
            Checked {sourceCount} published {sourceCount === 1 ? "node" : "nodes"} from {providerUrl}.
          </p>
        </div>
        <StatusBadge status={node.overallStatus} />
      </div>

      <div className="capabilityGrid" aria-label="Capability checklist result">
        {capabilityLabels.map(([key, label]) => (
          <span key={key} className={node.connect.capabilities?.[key] ? "checkPass" : "checkPending"}>
            {label}
          </span>
        ))}
        <span className={node.readiness.reachable.status === "ready" || node.readiness.reachable.status === "limited" ? "checkPass" : "checkPending"}>
          Reachable public route
        </span>
        <span className={node.connect.providerPublicKey ? "checkPass" : "checkPending"}>Provider public key</span>
        <span className={node.connect.providerCanonicalUrl ? "checkPass" : "checkPending"}>Canonical provider URL</span>
      </div>

      {provisionable ? <ProviderDetails node={node} /> : null}

      <div className="joinMetrics">
        <MetricRow label="Readiness" metric={node.readiness.provisioned} />
        <MetricRow label="Reachable" metric={node.readiness.reachable} />
        <MetricRow label="Commerce" metric={node.services.commerce} />
        <MetricRow label="Settlement" metric={node.services.settlement} />
        <MetricRow label="Proofs" metric={node.services.proofs} />
      </div>

      {reasons.length ? (
        <div className="reasonCloud">
          {reasons.map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>
      ) : null}

      <div className="heroActions">
        {provisionable ? (
          <a className="primaryAction" href={requestHref}>Request Listing</a>
        ) : (
          <a className="primaryAction" href="#requirements">Review Requirements</a>
        )}
        <Link className="cardLink" href="/">View Network Map</Link>
      </div>
    </section>
  );
}

export function EligibilityChecker() {
  const [providerUrl, setProviderUrl] = useState("");
  const [checkState, setCheckState] = useState<CheckState>({ status: "idle" });

  const requirements = useMemo(() => ({
    must: [
      "Provider URL",
      "Provider Node ID",
      "Provider Public Key",
      "Provider Profile ID if available",
      "Reachable public metadata",
      "Identity capability",
      "Content capability",
      "Proof capability",
      "Commerce/settlement status"
    ],
    should: [
      "Country / Region",
      "Operator name",
      "Public profile",
      "Proof history",
      "Stable canonical URL"
    ]
  }), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeProviderUrl(providerUrl);
    } catch (error) {
      setCheckState({ status: "error", providerUrl, message: error instanceof Error ? error.message : "Enter a valid provider URL." });
      return;
    }

    setProviderUrl(normalizedUrl);
    setCheckState({ status: "loading" });

    try {
      const response = await fetch(`${normalizedUrl}/api/network/nodes`, {
        headers: { accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`The node returned ${response.status} ${response.statusText}.`);
      }

      const data = (await response.json()) as NodesResponse;
      const nodes = Array.isArray(data.items) ? data.items : [];

      if (!nodes.length) {
        throw new Error("The public metadata route did not return any nodes.");
      }

      const exactMatch = nodes.find((node) => sameProviderUrl(node.connect?.providerCanonicalUrl || "", normalizedUrl));
      const eligibleNodes = nodes.filter(isMapEligibleNode);
      const node = exactMatch || (eligibleNodes.length === 1 ? eligibleNodes[0] : nodes[0]);

      setCheckState({ status: "result", node, providerUrl: normalizedUrl, sourceCount: nodes.length });
    } catch (error) {
      setCheckState({
        status: "error",
        providerUrl: normalizedUrl,
        message: error instanceof Error ? error.message : "We could not reach this node."
      });
    }
  }

  return (
    <div className="joinFlow">
      <section id="requirements" className="joinRequirements">
        <RequirementList title="A node must provide" items={requirements.must} />
        <RequirementList title="A node should also provide" items={requirements.should} />
      </section>

      <section className="panel checkerPanel" aria-labelledby="eligibility-checker">
        <div>
          <p className="eyebrow">Eligibility Checker</p>
          <h2 id="eligibility-checker">Check public discoverability</h2>
          <p className="muted">
            Enter your canonical provider URL. The checker reads public metadata only from `/api/network/nodes`.
          </p>
        </div>
        <form className="checkerForm" onSubmit={handleSubmit}>
          <label>
            <span>Provider URL</span>
            <input
              value={providerUrl}
              onChange={(event) => setProviderUrl(event.target.value)}
              placeholder="https://your-node.example"
              inputMode="url"
              autoComplete="url"
            />
          </label>
          <button className="primaryAction" type="submit" disabled={checkState.status === "loading"}>
            {checkState.status === "loading" ? "Checking..." : "Check Node Eligibility"}
          </button>
        </form>
      </section>

      {checkState.status === "loading" ? (
        <section className="panel eligibilityResult" aria-live="polite">
          <p className="eyebrow">Checking Node</p>
          <h2>Reading public metadata...</h2>
          <p className="muted">Fetching `/api/network/nodes` and evaluating map eligibility.</p>
        </section>
      ) : null}

      {checkState.status === "error" ? (
        <section className="panel eligibilityResult resultBlocked" aria-live="polite">
          <p className="eyebrow">Fetch Error</p>
          <h2>We could not reach this node.</h2>
          <p className="muted">{checkState.message}</p>
          <p className="muted">
            The node must expose <code>{checkState.providerUrl ? `${checkState.providerUrl}/api/network/nodes` : "/api/network/nodes"}</code> at its public canonical URL.
          </p>
        </section>
      ) : null}

      {checkState.status === "result" ? (
        <ResultPanel node={checkState.node} providerUrl={checkState.providerUrl} sourceCount={checkState.sourceCount} />
      ) : null}
    </div>
  );
}

import { NodeCard } from "@/components/NodeCard";
import {
  getNetworkNodes,
  isMapEligibleNode,
  isProvisionableNode,
  registryBaseUrl,
  shouldShowIneligibleNodes
} from "@/lib/network";

export default async function Home({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nodes = await getNetworkNodes();
  const showIneligibleNodes = shouldShowIneligibleNodes();
  const visibleNodes = showIneligibleNodes ? nodes : nodes.filter(isMapEligibleNode);
  const q = String(resolvedSearchParams?.q || "").trim().toLowerCase();
  const status = String(resolvedSearchParams?.status || "").trim().toLowerCase();
  const filtered = visibleNodes.filter((node) => {
    const haystack = [node.displayName, node.operator, node.nodeId, node.connect.providerCanonicalUrl, ...node.roles]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = q ? haystack.includes(q) : true;
    const matchesStatus = status ? node.overallStatus === status : true;
    return matchesQuery && matchesStatus;
  });

  return (
    <main>
      <section className="hero shell">
        <div className="heroCopy">
          <p className="eyebrow">Canonical Network Discovery</p>
          <h1>Discover sovereign Certifyd nodes you can provision from.</h1>
          <p className="heroText">
            network.certifyd.me is the public opportunity map for creator onboarding, provider readiness, and sovereign node provisioning.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#nodes">Explore providers</a>
            <span className="heroRule">Online is not the same thing as commerce-capable.</span>
          </div>
        </div>
        <div className="heroMapCard" aria-hidden="true">
          <div className="mapOrb mapOrbReady" />
          <div className="mapOrb mapOrbLimited" />
          <div className="mapOrb mapOrbProof" />
          <div className="mapLine mapLineA" />
          <div className="mapLine mapLineB" />
          <div className="mapLegend">
            <span>Provisionable providers</span>
            <strong>{visibleNodes.filter(isProvisionableNode).length}</strong>
          </div>
        </div>
      </section>

      <section className="shell summaryGrid" aria-label="Network summary">
        <div className="summaryCard"><p>Registered nodes</p><span>{nodes.length}</span></div>
        <div className="summaryCard"><p>Map-eligible</p><span>{visibleNodes.length}</span></div>
        <div className="summaryCard accent"><p>Provisionable</p><span>{visibleNodes.filter(isProvisionableNode).length}</span></div>
        <div className="summaryCard source"><p>Genesis Node / initial registry seed</p><span>{registryBaseUrl()}</span></div>
      </section>

      <section className="shell controlsPanel">
        <form className="controls" action="/">
          <label>
            <span>Search nodes</span>
            <input name="q" placeholder="Provider, operator, role, node ID" defaultValue={resolvedSearchParams?.q || ""} />
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={resolvedSearchParams?.status || ""}>
              <option value="">All statuses</option>
              <option value="ready">Ready</option>
              <option value="limited">Limited</option>
              <option value="disabled">Disabled</option>
              <option value="offline">Offline</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <button className="primaryAction" type="submit">Filter</button>
        </form>
      </section>

      <section id="nodes" className="shell mapGrid" aria-label="Network node directory">
        <div className="mapPreview panel">
          <p className="eyebrow">Map-ready Directory</p>
          <h2>Provider locations will appear here when eligible nodes publish public-safe coordinates.</h2>
          <p className="muted">Copy provider details and connect through ContentBox Network Settings.</p>
          <div className="mapKey">
            <span><i className="keyReady" /> Ready</span>
            <span><i className="keyLimited" /> Limited</span>
            <span><i className="keyProof" /> Proof capable</span>
          </div>
          {showIneligibleNodes ? <p className="muted">Debug mode is showing nodes that are not map-eligible.</p> : null}
        </div>
        <div className="nodeList">
          {filtered.length ? filtered.map((node) => <NodeCard key={node.nodeId} node={node} />) : (
            <div className="panel emptyState">
              {visibleNodes.length
                ? "No nodes match the current filters."
                : "No eligible nodes are ready for the public map. Nodes must publish valid provider identity, connection values, and reachable public metadata to appear."}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

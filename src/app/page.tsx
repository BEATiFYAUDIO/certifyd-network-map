import { NodeCard } from "@/components/NodeCard";
import { NetworkMap } from "@/components/NetworkMap";
import {
  getNetworkNodes,
  isMapEligibleNode,
  isProvisionableNode,
  type NetworkMapNode,
  shouldShowIneligibleNodes
} from "@/lib/network";

function commerceReadyCount(nodes: NetworkMapNode[]): number {
  return nodes.filter((node) => node.services.commerce.status === "ready" || node.services.commerce.status === "limited").length;
}

function verifiedOperatorCount(nodes: NetworkMapNode[]): number {
  return nodes.filter((node) => node.trust.operatorVerified || node.trust.proofCapable).length;
}

function coverageRegions(nodes: NetworkMapNode[]) {
  const countries = new Set<string>();
  const regions = new Set<string>();

  nodes.forEach((node) => {
    const country = String(node.location?.country || "").trim();
    const region = String(node.location?.region || "").trim();
    if (country) countries.add(country);
    if (country && region) regions.add(`${region}, ${country}`);
    else if (region) regions.add(region);
  });

  return { countries, regions };
}

function coverageCards(nodes: NetworkMapNode[]) {
  const countryCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();

  nodes.forEach((node) => {
    const country = String(node.location?.country || "").trim();
    const region = String(node.location?.region || "").trim();
    if (country) countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    if (region) regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
  });

  const cards = [
    ...Array.from(countryCounts.entries()).map(([label, count]) => ({ label, count, type: "Country" })),
    ...Array.from(regionCounts.entries()).map(([label, count]) => ({ label, count, type: "Region" }))
  ].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return cards.length ? cards : [{ label: "Global Network", count: nodes.length, type: "Coverage" }];
}

export default async function Home({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nodes = await getNetworkNodes();
  const showIneligibleNodes = shouldShowIneligibleNodes();
  const visibleNodes = showIneligibleNodes ? nodes : nodes.filter(isMapEligibleNode);
  const provisionableNodes = visibleNodes.filter(isProvisionableNode);
  const coverage = coverageRegions(visibleNodes);
  const regionCards = coverageCards(visibleNodes);
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
          <p className="eyebrow">Sovereign Network Discovery</p>
          <h1>Discover Sovereign Infrastructure</h1>
          <p className="heroText">
            Find trusted providers for identity, content, commerce, settlement, and proofs.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#network-map">Explore the network</a>
            <span className="heroRule">Trust, reachability, and commerce readiness in one view.</span>
          </div>
        </div>
        <div className="heroMapCard" aria-hidden="true">
          <div className="mapOrb mapOrbReady" />
          <div className="mapOrb mapOrbLimited" />
          <div className="mapOrb mapOrbProof" />
          <div className="mapLine mapLineA" />
          <div className="mapLine mapLineB" />
          <div className="mapLegend">
            <span>Verified provider graph</span>
            <strong>{provisionableNodes.length}</strong>
          </div>
        </div>
      </section>

      <section className="shell summaryGrid" aria-label="Network summary">
        <div className="summaryCard"><p>Eligible Providers</p><span>{visibleNodes.length}</span></div>
        <div className="summaryCard accent"><p>Commerce Ready</p><span>{commerceReadyCount(visibleNodes)}</span></div>
        <div className="summaryCard"><p>Verified Operators</p><span>{verifiedOperatorCount(visibleNodes)}</span></div>
        <div className="summaryCard"><p>Countries / Regions Covered</p><span>{coverage.countries.size} / {coverage.regions.size}</span></div>
      </section>

      <NetworkMap nodes={visibleNodes} />

      <section className="shell coverageSection" aria-label="Regional coverage">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Regional Coverage</p>
            <h2>Coverage is starting to compound.</h2>
          </div>
          <p className="muted">Country, region, trust, coverage, and graph views can layer onto this same registry.</p>
        </div>
        <div className="coverageGrid">
          {regionCards.slice(0, 6).map((card) => (
            <div className="coverageCard" key={`${card.type}-${card.label}`}>
              <p>{card.type}</p>
              <h3>{card.label}</h3>
              <span>{card.count} {card.count === 1 ? "Provider" : "Providers"}</span>
            </div>
          ))}
        </div>
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

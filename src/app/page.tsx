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
          <p className="eyebrow">Sovereign Creator Commerce</p>
          <h1>Support Creators. Run Commerce Infrastructure.</h1>
          <p className="heroText">
            Every creator needs a way to get paid. The Sovereign Network connects creators with independent operators who
            provide commerce infrastructure.
          </p>
          <p className="muted">
            If you believe creators deserve direct access to their customers, direct settlement, and greater independence
            from platforms, this network is for you.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="/join">Become a Node Operator</a>
            <a className="cardLink" href="#network-map">Explore Network</a>
          </div>
        </div>
        <div className="heroMapCard" aria-hidden="true">
          <div className="mapOrb mapOrbReady" />
          <div className="mapOrb mapOrbLimited" />
          <div className="mapOrb mapOrbProof" />
          <div className="mapLine mapLineA" />
          <div className="mapLine mapLineB" />
          <div className="mapLegend">
            <span>Creator commerce operators</span>
            <strong>{provisionableNodes.length}</strong>
          </div>
        </div>
      </section>

      <section className="shell summaryGrid" aria-label="Network summary">
        <div className="summaryCard"><p>Active Operators</p><span>{visibleNodes.length}</span></div>
        <div className="summaryCard accent"><p>Commerce Ready</p><span>{commerceReadyCount(visibleNodes)}</span></div>
        <div className="summaryCard"><p>Verified Operators</p><span>{verifiedOperatorCount(visibleNodes)}</span></div>
        <div className="summaryCard"><p>Countries / Regions Covered</p><span>{coverage.countries.size} / {coverage.regions.size}</span></div>
      </section>

      <section className="shell coverageSection" aria-label="Node operator overview">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">What Is A Node Operator?</p>
            <h2>A node operator provides commerce services to creators.</h2>
          </div>
          <p className="muted">
            When a creator sells something through the network, node operators help make that transaction possible. Think
            of it as supporting creator-owned commerce rather than platform-owned commerce.
          </p>
        </div>
      </section>

      <section className="shell coverageSection" aria-label="Why run a node">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Why Run A Node?</p>
            <h2>Build the alternative for creator commerce.</h2>
          </div>
        </div>
        <div className="coverageGrid">
          <div className="coverageCard">
            <p>Help Creators Get Paid</p>
            <h3>Direct creator-to-fan transactions.</h3>
            <span>Support creators when they sell directly.</span>
          </div>
          <div className="coverageCard">
            <p>Support Independent Businesses</p>
            <h3>Artists, labels, educators, and communities.</h3>
            <span>Help independent work build sustainable revenue.</span>
          </div>
          <div className="coverageCard">
            <p>Strengthen The Network</p>
            <h3>More operators means more resilience.</h3>
            <span>Every operator increases reach and availability.</span>
          </div>
          <div className="coverageCard">
            <p>Build The Alternative</p>
            <h3>More options. More control.</h3>
            <span>Help create better infrastructure for creators.</span>
          </div>
        </div>
      </section>

      <section className="shell coverageSection" aria-label="Who we need">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Who We Need</p>
            <h2>Independent operators, Bitcoiners, music people, entrepreneurs, and technologists.</h2>
          </div>
          <p className="muted">People who believe creators deserve better infrastructure.</p>
        </div>
      </section>

      <section className="shell coverageSection" aria-label="Operator services">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">What Operators Provide Today</p>
            <h2>Commerce. Settlement. Network availability.</h2>
          </div>
          <p className="muted">
            That&apos;s it. Simple. The network starts with commerce because creators can&apos;t build sustainable
            businesses if they don&apos;t control how they get paid.
          </p>
        </div>
      </section>

      <section className="shell coverageSection" aria-label="The mission">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">The Mission</p>
            <h2>Most creator platforms extract value from creators. We&apos;re trying to do the opposite.</h2>
          </div>
          <p className="muted">
            We&apos;re building infrastructure that helps creators earn, sell, and grow independently. Not by replacing
            creators. Not by controlling creators. By supporting them.
          </p>
        </div>
      </section>

      <NetworkMap nodes={visibleNodes} />

      <section className="shell coverageSection" aria-label="Regional coverage">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Regional Coverage</p>
            <h2>Explore active operators supporting creator commerce across the network.</h2>
          </div>
          <p className="muted">View coverage, readiness, and availability.</p>
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
          <p className="eyebrow">Join The Network</p>
          <h2>We&apos;re early. The network is small. The opportunity is significant.</h2>
          <p className="muted">If you want to help creators build independent businesses, we&apos;d love to talk.</p>
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

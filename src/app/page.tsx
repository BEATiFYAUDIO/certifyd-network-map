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
          <h1>Support Creators. Earn Together.</h1>
          <p className="heroText">
            Creators need a way to sell. Creators need a way to get paid.
          </p>
          <p className="muted">
            The Sovereign Creator Commerce Network connects creators with independent operators who help make that possible.
          </p>
          <p className="muted">
            When creators succeed, operators succeed.
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
        <div className="summaryCard"><p>Founding Operators</p><span>{visibleNodes.length}</span></div>
        <div className="summaryCard accent"><p>Commerce Active</p><span>{commerceReadyCount(visibleNodes)}</span></div>
        <div className="summaryCard source"><p>Technical Beta</p><span>2026</span></div>
        <div className="summaryCard source"><p>Now Onboarding</p><span>Open</span></div>
      </section>

      <section className="shell coverageSection" aria-label="Why run a node">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Why Become An Operator?</p>
            <h2>Support creators. Earn together.</h2>
          </div>
        </div>
        <div className="coverageGrid">
          <div className="coverageCard">
            <p>Operator Opportunity</p>
            <h3>Help Creators Get Paid</h3>
            <span>Support direct creator-to-fan commerce.</span>
          </div>
          <div className="coverageCard">
            <p>Operator Opportunity</p>
            <h3>Earn From Network Activity</h3>
            <span>Participate in the value flowing through the network.</span>
          </div>
          <div className="coverageCard">
            <p>Operator Opportunity</p>
            <h3>Support Independent Businesses</h3>
            <span>Help artists, labels, educators, publishers, and communities build sustainable revenue.</span>
          </div>
          <div className="coverageCard">
            <p>Operator Opportunity</p>
            <h3>Build The Alternative</h3>
            <span>Help create infrastructure designed to serve creators.</span>
          </div>
        </div>
      </section>

      <section className="shell coverageSection operatorAudienceSection" aria-label="Who we need">
        <div className="sectionHeader compactHeader">
          <div>
            <p className="eyebrow">Who We Need</p>
            <h2>Operators who can move creator commerce forward.</h2>
          </div>
          <p className="muted">People who believe creators deserve better options.</p>
        </div>
        <div className="audiencePillGrid" aria-label="Operator types">
          <span>Builders</span>
          <span>Entrepreneurs</span>
          <span>Bitcoiners</span>
          <span>Technologists</span>
          <span>Music industry operators</span>
        </div>
      </section>

      <section className="shell coverageSection" aria-label="The mission">
        <div className="missionPanel">
          <div>
            <p className="eyebrow">The Mission</p>
            <h2>Less extraction. More shared upside.</h2>
          </div>
          <div className="missionCopy">
            <p>Most creator platforms extract value from creators. We&apos;re trying to do the opposite.</p>
            <p>Creators earn from their work. Operators earn by supporting creator commerce.</p>
            <p>Together they create a stronger, more independent ecosystem.</p>
          </div>
        </div>
      </section>

      <NetworkMap nodes={visibleNodes} />

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
          <p className="eyebrow">Operator Path</p>
          <h2>Register Your Node</h2>
          <p className="muted">Already running sovereign infrastructure?</p>
          <p className="muted">Register your node and help support creators.</p>
          <a className="primaryAction" href="/join">Register Node</a>
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

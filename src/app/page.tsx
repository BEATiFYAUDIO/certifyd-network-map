import { NodeCard } from "@/components/NodeCard";
import { getNetworkNodes, registryBaseUrl } from "@/lib/network";

function countReady(nodes: Awaited<ReturnType<typeof getNetworkNodes>>) {
  return nodes.filter((node) => node.overallStatus === "ready").length;
}

export default async function Home({ searchParams }: { searchParams?: { q?: string; status?: string } }) {
  const nodes = await getNetworkNodes();
  const q = String(searchParams?.q || "").trim().toLowerCase();
  const status = String(searchParams?.status || "").trim().toLowerCase();
  const filtered = nodes.filter((node) => {
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
        <p className="eyebrow">Public Network Map</p>
        <h1>Discover sovereign Certifyd infrastructure providers.</h1>
        <p className="heroText">
          Review service capability, trust, durability, and readiness before provisioning your creator profile through a node.
        </p>
        <div className="heroRule">Online is not the same thing as commerce-capable.</div>
      </section>

      <section className="shell summaryGrid" aria-label="Network summary">
        <div className="summaryCard"><span>{nodes.length}</span><p>Registered nodes</p></div>
        <div className="summaryCard"><span>{countReady(nodes)}</span><p>Ready providers</p></div>
        <div className="summaryCard"><span>{registryBaseUrl()}</span><p>Registry source</p></div>
      </section>

      <section className="shell controlsPanel">
        <form className="controls" action="/">
          <label>
            <span>Search nodes</span>
            <input name="q" placeholder="Provider, operator, role, node ID" defaultValue={searchParams?.q || ""} />
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={searchParams?.status || ""}>
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

      <section className="shell mapGrid" aria-label="Network node directory">
        <div className="mapPreview panel">
          <p className="eyebrow">Map-ready Directory</p>
          <h2>Provider locations will appear here when nodes publish public-safe coordinates.</h2>
          <p className="muted">Until then, the directory below is the source of truth for provisioning decisions.</p>
        </div>
        <div className="nodeList">
          {filtered.length ? filtered.map((node) => <NodeCard key={node.nodeId} node={node} />) : (
            <div className="panel emptyState">No nodes match the current filters.</div>
          )}
        </div>
      </section>
    </main>
  );
}

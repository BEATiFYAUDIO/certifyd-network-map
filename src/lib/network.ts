export type NetworkMapStatus = "ready" | "limited" | "disabled" | "offline" | "unknown";

export type NetworkMapMetric = {
  status: NetworkMapStatus;
  message?: string;
  reasonCodes?: string[];
  score?: number | null;
};

export type NetworkMapNode = {
  nodeId: string;
  displayName: string;
  operator?: string;
  roles: Array<"creator" | "identity" | "content" | "commerce" | "settlement" | "proof">;
  location?: {
    region?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  overallStatus: NetworkMapStatus;
  services: {
    identity: NetworkMapMetric;
    content: NetworkMapMetric;
    commerce: NetworkMapMetric;
    settlement: NetworkMapMetric;
    proofs: NetworkMapMetric;
  };
  readiness: {
    provisioned: NetworkMapMetric;
    durable: NetworkMapMetric;
    reachable: NetworkMapMetric;
  };
  trust: {
    operatorVerified: boolean;
    proofCapable: boolean;
    proofCount?: number;
    trustScore?: number;
  };
  history?: {
    nodeAgeDays?: number | null;
    reliability30d?: number | null;
    reliability90d?: number | null;
    successfulPayments30d?: number | null;
  };
  connect: {
    providerNodeId: string;
    providerPublicKey: string;
    providerProfileId: string | null;
    providerCanonicalUrl: string;
    capabilities: {
      identity: boolean;
      content: boolean;
      commerce: boolean;
      settlement: boolean;
      proofs: boolean;
    };
  };
  technical?: {
    version?: string;
    network?: string;
  };
};

type NodesResponse = {
  schema: string;
  generatedAt: string;
  items: NetworkMapNode[];
};

type NodeResponse = {
  schema: string;
  generatedAt: string;
  node: NetworkMapNode;
};

const DEFAULT_REGISTRY_URL = "https://certifyd.beatifygroup.com";

export function registryBaseUrl(): string {
  return String(process.env.NEXT_PUBLIC_NETWORK_REGISTRY_URL || DEFAULT_REGISTRY_URL).replace(/\/$/, "");
}

async function registryFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${registryBaseUrl()}${path}`, {
    next: { revalidate: 30 },
    headers: { accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Registry request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getNetworkNodes(): Promise<NetworkMapNode[]> {
  const data = await registryFetch<NodesResponse>("/api/network/nodes");
  return Array.isArray(data.items) ? data.items : [];
}

export async function getNetworkNode(nodeId: string): Promise<NetworkMapNode> {
  const data = await registryFetch<NodeResponse>(`/api/network/nodes/${encodeURIComponent(nodeId)}`);
  return data.node;
}

export function contentboxNetworkSettingsUrl(): string {
  return String(process.env.NEXT_PUBLIC_CONTENTBOX_NETWORK_SETTINGS_URL || "").trim();
}

export function statusLabel(status: NetworkMapStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function reasonLabel(reason: string): string {
  return reason
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

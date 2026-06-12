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
const DEBUG_INELIGIBLE_NODES = "true";

const STATIC_NETWORK_NODES: NetworkMapNode[] = [
  {
    nodeId: "node:768fef95328f2621ed0b01caf69d39ac4a0a915a1de6ec4506ac5a075928d76e",
    displayName: "Certifyd Creator Profile",
    operator: "Certifyd",
    roles: ["creator", "identity", "content", "commerce", "settlement", "proof"],
    overallStatus: "limited",
    services: {
      identity: { status: "ready" },
      content: { status: "ready" },
      commerce: {
        status: "limited",
        message: "Provider role is advertised but commerce readiness is degraded.",
        reasonCodes: ["LOW_INBOUND_LIQUIDITY"],
        score: 84
      },
      settlement: {
        status: "limited",
        message: "Settlement readiness is degraded.",
        reasonCodes: ["LOW_INBOUND_LIQUIDITY"],
        score: 84
      },
      proofs: { status: "ready" }
    },
    readiness: {
      provisioned: {
        status: "limited",
        message: "Node is not fully ready to provision creators.",
        reasonCodes: ["COMMERCE_LIMITED", "SETTLEMENT_LIMITED"],
        score: 50
      },
      durable: {
        status: "ready",
        reasonCodes: ["COMMERCE_LIMITED"],
        score: 85
      },
      reachable: { status: "ready" }
    },
    trust: {
      operatorVerified: true,
      proofCapable: true,
      proofCount: 3
    },
    history: {
      nodeAgeDays: null,
      reliability30d: null,
      reliability90d: null,
      successfulPayments30d: null
    },
    connect: {
      providerNodeId: "node:768fef95328f2621ed0b01caf69d39ac4a0a915a1de6ec4506ac5a075928d76e",
      providerPublicKey: "ed25519:MCowBQYDK2VwAyEAP-5l7T3Ej7fZJDfxus5KEQJSMc-aGjXr1BSMpsDd9yY",
      providerProfileId: "cmolwkufl0006vjwo9jkwvvq6",
      providerCanonicalUrl: "https://public.certifyd.me",
      capabilities: {
        identity: true,
        content: true,
        commerce: true,
        settlement: true,
        proofs: true
      }
    },
    technical: {
      version: "network-map-v1",
      network: "certifyd"
    }
  }
];

export function registryBaseUrl(): string {
  return String(process.env.NEXT_PUBLIC_NETWORK_REGISTRY_URL || DEFAULT_REGISTRY_URL).replace(/\/$/, "");
}

function mergeNetworkNodes(nodes: NetworkMapNode[]): NetworkMapNode[] {
  const seen = new Set<string>();
  const merged: NetworkMapNode[] = [];

  for (const node of [...nodes, ...STATIC_NETWORK_NODES]) {
    const key = String(node.nodeId || node.connect?.providerCanonicalUrl || "").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(node);
  }

  return merged;
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
  return mergeNetworkNodes(Array.isArray(data.items) ? data.items : []);
}

export async function getNetworkNode(nodeId: string): Promise<NetworkMapNode> {
  const staticNode = STATIC_NETWORK_NODES.find((node) => node.nodeId === nodeId);
  if (staticNode) return staticNode;

  const data = await registryFetch<NodeResponse>(`/api/network/nodes/${encodeURIComponent(nodeId)}`);
  return data.node;
}

function hasValue(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function isEnabledStatus(status?: NetworkMapStatus): boolean {
  return status !== "disabled" && status !== "offline";
}

function isReadyOrLimited(status?: NetworkMapStatus): boolean {
  return status === "ready" || status === "limited";
}

function hasProviderConnection(node: NetworkMapNode): boolean {
  return Boolean(
    hasValue(node.nodeId) &&
    hasValue(node.connect?.providerNodeId) &&
    hasValue(node.connect?.providerPublicKey) &&
    hasValue(node.connect?.providerCanonicalUrl)
  );
}

export function isMapEligibleNode(node: NetworkMapNode): boolean {
  return Boolean(
    hasProviderConnection(node) &&
    isEnabledStatus(node.services?.identity?.status) &&
    isReadyOrLimited(node.readiness?.reachable?.status)
  );
}

export function isProvisionableNode(node: NetworkMapNode): boolean {
  const capabilities = node.connect?.capabilities;
  const hasCapability = capabilities ? Object.values(capabilities).some(Boolean) : false;

  return Boolean(
    isMapEligibleNode(node) &&
    isReadyOrLimited(node.readiness?.provisioned?.status) &&
    hasCapability &&
    hasValue(node.connect?.providerCanonicalUrl)
  );
}

export function getNodeEligibilityReasons(node: NetworkMapNode): string[] {
  const reasons: string[] = [];

  if (!hasValue(node.nodeId)) reasons.push("Missing node ID");
  if (!hasValue(node.connect?.providerNodeId)) reasons.push("Missing provider node ID");
  if (!hasValue(node.connect?.providerPublicKey)) reasons.push("Missing provider public key");
  if (!hasValue(node.connect?.providerCanonicalUrl)) reasons.push("Missing provider canonical URL");
  if (!isEnabledStatus(node.services?.identity?.status)) reasons.push("Identity service is disabled or offline");
  if (!isReadyOrLimited(node.readiness?.reachable?.status)) reasons.push("Node is not reachable");

  if (isMapEligibleNode(node)) {
    const capabilities = node.connect?.capabilities;
    const hasCapability = capabilities ? Object.values(capabilities).some(Boolean) : false;
    if (!isReadyOrLimited(node.readiness?.provisioned?.status)) reasons.push("Provisioning is not ready or limited");
    if (!hasCapability) reasons.push("No provider capabilities are enabled");
  }

  return reasons;
}

export function shouldShowIneligibleNodes(): boolean {
  return String(process.env.NEXT_PUBLIC_SHOW_INELIGIBLE_NODES || "").toLowerCase() === DEBUG_INELIGIBLE_NODES;
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

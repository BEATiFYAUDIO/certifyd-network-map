import { isMapEligibleNode, type NetworkMapNode, type NetworkMapStatus } from "@/lib/network";

export type MappableNode = {
  node: NetworkMapNode;
  longitude: number;
  latitude: number;
  label: string;
  clusterCount: number;
};

type KnownLocation = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const KNOWN_LOCATIONS: Record<string, KnownLocation> = {
  "innisfil, ontario, canada": { longitude: -79.5464, latitude: 44.3001, zoom: 9 },
  "innisfil, ontario": { longitude: -79.5464, latitude: 44.3001, zoom: 9 },
  "simcoe county, ontario, canada": { longitude: -79.8661, latitude: 44.5834, zoom: 7 },
  "simcoe county, ontario": { longitude: -79.8661, latitude: 44.5834, zoom: 7 },
  "ontario, canada": { longitude: -85.3232, latitude: 50.0007, zoom: 4 },
  ontario: { longitude: -85.3232, latitude: 50.0007, zoom: 4 },
  canada: { longitude: -106.3468, latitude: 56.1304, zoom: 3 }
};

export const STATUS_COLORS: Record<NetworkMapStatus, string> = {
  ready: "#4ade80",
  limited: "#f59e0b",
  disabled: "#ef4444",
  offline: "#94a3b8",
  unknown: "#cbd5e1"
};

function normalizeLocationKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ");
}

function isSafeCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function resolveNodeLocation(node: NetworkMapNode): KnownLocation | null {
  const location = node.location;
  if (!location) return null;

  if (isSafeCoordinate(location.lat) && isSafeCoordinate(location.lng)) {
    return {
      latitude: location.lat,
      longitude: location.lng,
      zoom: 8
    };
  }

  const candidates = [
    location.displayLocation,
    [location.city, location.region, location.country].filter(Boolean).join(", "),
    [location.region, location.country].filter(Boolean).join(", "),
    location.country
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map(normalizeLocationKey);

  for (const candidate of candidates) {
    const match = KNOWN_LOCATIONS[candidate];
    if (match) return match;
  }

  return null;
}

export function mappableNodes(nodes: NetworkMapNode[]): MappableNode[] {
  const samePlaceCount = new Map<string, number>();
  const samePlaceTotal = new Map<string, number>();
  const resolvedNodes = nodes
    .filter(isMapEligibleNode)
    .map((node) => {
      const resolved = resolveNodeLocation(node);
      if (!resolved) return null;
      const placeKey = `${resolved.longitude.toFixed(4)},${resolved.latitude.toFixed(4)}`;
      samePlaceTotal.set(placeKey, (samePlaceTotal.get(placeKey) || 0) + 1);
      return { node, resolved, placeKey };
    })
    .filter((item): item is { node: NetworkMapNode; resolved: KnownLocation; placeKey: string } => Boolean(item));

  return resolvedNodes
    .map(({ node, resolved, placeKey }) => {
      const index = samePlaceCount.get(placeKey) || 0;
      samePlaceCount.set(placeKey, index + 1);
      const clusterCount = samePlaceTotal.get(placeKey) || 1;
      const offsetRadius = index === 0 ? 0 : Math.min(0.12, 0.036 + clusterCount * 0.006);
      const angle = index * 1.61803398875 * Math.PI;
      return {
        node,
        longitude: resolved.longitude + Math.cos(angle) * offsetRadius,
        latitude: resolved.latitude + Math.sin(angle) * offsetRadius,
        label: node.location?.displayLocation || [node.location?.city, node.location?.region, node.location?.country].filter(Boolean).join(", "),
        clusterCount
      };
    });
}

export function initialViewForNodes(nodes: MappableNode[]) {
  if (!nodes.length) {
    return { longitude: -96.8, latitude: 55.2, zoom: 2.7 };
  }
  if (nodes.length === 1) {
    return {
      longitude: nodes[0].longitude - 7,
      latitude: nodes[0].latitude + 2,
      zoom: 4.1
    };
  }
  const longitude = nodes.reduce((sum, item) => sum + item.longitude, 0) / nodes.length;
  const latitude = nodes.reduce((sum, item) => sum + item.latitude, 0) / nodes.length;
  return { longitude, latitude, zoom: nodes.length < 6 ? 4.2 : 3.3 };
}

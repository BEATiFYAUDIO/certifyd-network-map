import { isMapEligibleNode, type NetworkMapNode, type NetworkMapStatus } from "@/lib/network";

export type MappableNode = {
  node: NetworkMapNode;
  longitude: number;
  latitude: number;
  label: string;
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
  ready: "#22c55e",
  limited: "#facc15",
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
  return nodes
    .filter(isMapEligibleNode)
    .map((node) => {
      const resolved = resolveNodeLocation(node);
      if (!resolved) return null;
      const placeKey = `${resolved.longitude.toFixed(4)},${resolved.latitude.toFixed(4)}`;
      const index = samePlaceCount.get(placeKey) || 0;
      samePlaceCount.set(placeKey, index + 1);
      const offsetRadius = index === 0 ? 0 : 0.045;
      const angle = index * 1.61803398875 * Math.PI;
      return {
        node,
        longitude: resolved.longitude + Math.cos(angle) * offsetRadius,
        latitude: resolved.latitude + Math.sin(angle) * offsetRadius,
        label: node.location?.displayLocation || [node.location?.city, node.location?.region, node.location?.country].filter(Boolean).join(", ")
      };
    })
    .filter((item): item is MappableNode => Boolean(item));
}

export function initialViewForNodes(nodes: MappableNode[]) {
  if (!nodes.length) {
    return { longitude: -96.8, latitude: 55.2, zoom: 2.7 };
  }
  if (nodes.length === 1) {
    const resolved = resolveNodeLocation(nodes[0].node);
    return {
      longitude: nodes[0].longitude,
      latitude: nodes[0].latitude,
      zoom: resolved?.zoom || 5
    };
  }
  const longitude = nodes.reduce((sum, item) => sum + item.longitude, 0) / nodes.length;
  const latitude = nodes.reduce((sum, item) => sum + item.latitude, 0) / nodes.length;
  return { longitude, latitude, zoom: 3.8 };
}

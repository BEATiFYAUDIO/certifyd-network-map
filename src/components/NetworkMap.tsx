"use client";

import Link from "next/link";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { areaProviderCountLabel, areaProviderSummaries, initialViewForAreas, mappableAreas, STATUS_COLORS, type MappableArea } from "@/lib/locationResolver";
import { statusLabel, type NetworkMapNode } from "@/lib/network";

const DARK_BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function ProviderAreaContent({ area }: { area: MappableArea }) {
  return (
    <div className="popupContent">
      <div className="popupTopline">
        <span className={`statusDot statusDot-${area.status}`} />
        <span>{area.clusterCount > 1 ? `${area.clusterCount} providers` : statusLabel(area.status)}</span>
      </div>
      <h3>{area.label}</h3>
      <p className="popupAreaCount">{areaProviderCountLabel(area)}</p>
      <p className="popupLocation">Approximate public area. Not an exact node location.</p>
      <div className="popupProviderList">
        {areaProviderSummaries(area).map((provider) => (
          <div className="popupProviderCard" key={provider.nodeId}>
            <div>
              <strong>{provider.displayName}</strong>
              {provider.operator ? <p className="popupOperator">Operator: {provider.operator}</p> : null}
            </div>
            <div className="popupChips">
              <span>{statusLabel(provider.overallStatus)}</span>
              <span>{statusLabel(provider.commerceStatus)} commerce</span>
              <span>{statusLabel(provider.proofsStatus)} proofs</span>
              <span>{provider.provisionable ? "Provisionable" : "Not provisionable"}</span>
            </div>
            <Link href={`/node/${encodeURIComponent(provider.nodeId)}`}>Review Operator</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetworkMap({ nodes }: { nodes: NetworkMapNode[] }) {
  const areas = useMemo(() => mappableAreas(nodes), [nodes]);
  const initialViewState = useMemo(() => initialViewForAreas(areas), [areas]);
  const [selected, setSelected] = useState<MappableArea | null>(null);
  const mappedProviders = areas.reduce((sum, area) => sum + area.nodes.length, 0);
  const mappedNodes = areas.flatMap((area) => area.nodes);
  const commerceReady = mappedNodes.filter((node) => node.services.commerce.status === "ready" || node.services.commerce.status === "limited").length;
  const verifiedOperators = mappedNodes.filter((node) => node.trust.operatorVerified || node.trust.proofCapable).length;

  return (
    <section id="network-map" className="shell physicalMapSection" aria-label="Physical network map">
      <div className="sectionHeader mapSectionHeader">
        <div>
          <p className="eyebrow">Network Map</p>
          <h2>Explore active operators supporting creator commerce across the network.</h2>
          <p className="muted">
            View coverage, readiness, and availability. Operator-declared approximate locations only.
          </p>
        </div>
        <div className="mapStats">
          <span><strong>{mappedProviders}</strong> operators mapped</span>
          <span><strong>{commerceReady}</strong> commerce-ready</span>
          <span><strong>{verifiedOperators}</strong> verified</span>
        </div>
      </div>

      {areas.length ? (
        <div className={`physicalMapPanel${selected ? " hasSelectedArea" : ""}`}>
          <div className="mapChrome mapChromeTop">
            <span>Coverage</span>
            <strong>North America</strong>
          </div>
          <div className="mapModeRail" aria-hidden="true">
            <span className="active">Coverage</span>
            <span>Trust</span>
            <span>Density</span>
            <span>Graph</span>
          </div>
          <div className="mapModePlaceholder">Coverage data will appear as the network grows.</div>
          <Map
            initialViewState={initialViewState}
            mapStyle={DARK_BASEMAP_STYLE}
            cooperativeGestures
            attributionControl={false}
            minZoom={2}
            maxZoom={12}
            dragRotate={false}
            pitchWithRotate={false}
          >
            <NavigationControl position="top-right" />
            {areas.map((area) => (
              <Marker
                key={area.id}
                longitude={area.longitude}
                latitude={area.latitude}
                anchor="bottom"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  setSelected(area);
                }}
              >
                <button
                  type="button"
                  className={`mapMarker${area.clusterCount > 1 ? " mapMarkerClustered" : ""}`}
                  style={{ "--marker-color": STATUS_COLORS[area.status] } as CSSProperties}
                  aria-label={`Open ${area.label} provider area details`}
                >
                  <span className="markerPulse" />
                  {area.clusterCount > 1 ? <span className="markerCluster">{area.clusterCount}</span> : null}
                </button>
              </Marker>
            ))}
          </Map>
          <div className="mapLegendOverlay">
            <span><i className="keyReady" /> Ready</span>
            <span><i className="keyLimited" /> Limited</span>
            <span><i className="keyDisabled" /> Disabled</span>
            <span><i className="keyOffline" /> Offline</span>
          </div>
          {selected ? (
            <div className="mapDetailsDrawer" role="dialog" aria-modal="false" aria-label={`${selected.label} providers`}>
              <button type="button" className="mapDetailsClose" onClick={() => setSelected(null)} aria-label="Close provider details">
                Close
              </button>
              <ProviderAreaContent area={selected} />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="panel emptyState">
          Operators will appear here once they publish public location metadata.
        </div>
      )}
    </section>
  );
}

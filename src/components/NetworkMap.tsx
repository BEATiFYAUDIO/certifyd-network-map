"use client";

import Link from "next/link";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { initialViewForAreas, mappableAreas, STATUS_COLORS, type MappableArea } from "@/lib/locationResolver";
import { isProvisionableNode, statusLabel, type NetworkMapNode } from "@/lib/network";

const DARK_BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

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
          <p className="eyebrow">Live Coverage Layer</p>
          <h2>Where trusted infrastructure is forming.</h2>
          <p className="muted">
            Operator-declared approximate locations only. No IP geolocation, no street addresses, no private coordinates.
          </p>
        </div>
        <div className="mapStats">
          <span><strong>{mappedProviders}</strong> mapped</span>
          <span><strong>{commerceReady}</strong> commerce-ready</span>
          <span><strong>{verifiedOperators}</strong> verified</span>
        </div>
      </div>

      {areas.length ? (
        <div className="physicalMapPanel">
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
            {selected ? (
              <Popup
                longitude={selected.longitude}
                latitude={selected.latitude}
                anchor="top"
                closeButton
                closeOnClick={false}
                onClose={() => setSelected(null)}
                className="nodePopup"
              >
                <div className="popupContent">
                  <div className="popupTopline">
                    <span className={`statusDot statusDot-${selected.status}`} />
                    <span>{selected.clusterCount > 1 ? `${selected.clusterCount} providers` : statusLabel(selected.status)}</span>
                  </div>
                  <h3>{selected.label}</h3>
                  <p className="popupLocation">Approximate public area. Not an exact node location.</p>
                  <div className="popupProviderList">
                    {selected.nodes.map((node) => (
                      <div className="popupProviderCard" key={node.nodeId}>
                        <div>
                          <strong>{node.displayName}</strong>
                          {node.operator ? <p className="popupOperator">Operator: {node.operator}</p> : null}
                        </div>
                        <div className="popupChips">
                          <span>{statusLabel(node.overallStatus)}</span>
                          <span>{statusLabel(node.services.commerce.status)} commerce</span>
                          <span>{statusLabel(node.services.proofs.status)} proofs</span>
                          <span>{isProvisionableNode(node) ? "Provisionable" : "Not provisionable"}</span>
                        </div>
                        <Link href={`/node/${encodeURIComponent(node.nodeId)}`}>Review Provider</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            ) : null}
          </Map>
          <div className="mapLegendOverlay">
            <span><i className="keyReady" /> Ready</span>
            <span><i className="keyLimited" /> Limited</span>
            <span><i className="keyDisabled" /> Disabled</span>
            <span><i className="keyOffline" /> Offline</span>
          </div>
        </div>
      ) : (
        <div className="panel emptyState">
          Eligible nodes will appear here once operators publish public location metadata.
        </div>
      )}
    </section>
  );
}

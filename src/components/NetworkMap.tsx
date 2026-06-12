"use client";

import Link from "next/link";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { initialViewForNodes, mappableNodes, STATUS_COLORS, type MappableNode } from "@/lib/locationResolver";
import { isProvisionableNode, statusLabel, type NetworkMapNode } from "@/lib/network";

const DARK_BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function NetworkMap({ nodes }: { nodes: NetworkMapNode[] }) {
  const markers = useMemo(() => mappableNodes(nodes), [nodes]);
  const initialViewState = useMemo(() => initialViewForNodes(markers), [markers]);
  const [selected, setSelected] = useState<MappableNode | null>(null);
  const mappedProviders = markers.length;
  const commerceReady = markers.filter((marker) => marker.node.services.commerce.status === "ready" || marker.node.services.commerce.status === "limited").length;
  const verifiedOperators = markers.filter((marker) => marker.node.trust.operatorVerified || marker.node.trust.proofCapable).length;

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

      {markers.length ? (
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
            {markers.map((marker) => (
              <Marker
                key={marker.node.nodeId}
                longitude={marker.longitude}
                latitude={marker.latitude}
                anchor="bottom"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  setSelected(marker);
                }}
              >
                <button
                  type="button"
                  className="mapMarker"
                  style={{ "--marker-color": STATUS_COLORS[marker.node.overallStatus] } as CSSProperties}
                  aria-label={`Open ${marker.node.displayName} map details`}
                >
                  <span className="markerPulse" />
                  {marker.clusterCount > 1 ? <span className="markerCluster">{marker.clusterCount}</span> : null}
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
                    <span className={`statusDot statusDot-${selected.node.overallStatus}`} />
                    <span>{statusLabel(selected.node.overallStatus)}</span>
                  </div>
                  <h3>{selected.node.displayName}</h3>
                  {selected.node.operator ? <p className="popupOperator">Operator: {selected.node.operator}</p> : null}
                  <p className="popupLocation">{selected.node.location?.displayLocation || selected.label || "Approximate public location"}</p>
                  <div className="popupChips">
                    <span>{statusLabel(selected.node.services.commerce.status)} commerce</span>
                    <span>{statusLabel(selected.node.services.proofs.status)} proofs</span>
                    <span>{isProvisionableNode(selected.node) ? "Provisionable" : "Not provisionable"}</span>
                  </div>
                  <p className="popupSummary">
                    Identity, content, settlement, and proof signals are available for review before connecting.
                  </p>
                  <Link href={`/node/${encodeURIComponent(selected.node.nodeId)}`}>Review Provider</Link>
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

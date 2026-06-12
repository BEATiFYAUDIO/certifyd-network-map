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
          <div className="geoFallback" aria-hidden="true">
            <svg viewBox="0 0 1200 620" role="presentation">
              <path className="geoLand geoCanada" d="M146 125 C255 75 376 77 503 116 C611 149 705 120 806 143 C914 170 1010 218 1055 292 C973 284 886 292 807 328 C728 364 646 376 559 352 C478 329 420 277 336 278 C254 279 184 244 146 125 Z" />
              <path className="geoLand geoUs" d="M244 310 C330 281 436 299 535 345 C646 396 747 372 855 332 C932 303 1011 317 1062 381 C988 464 872 508 739 510 C609 512 494 478 394 424 C321 385 270 365 244 310 Z" />
              <path className="geoWater" d="M623 304 C646 289 686 294 704 314 C675 326 646 327 623 304 Z" />
              <path className="geoWater" d="M687 326 C724 306 780 312 812 344 C772 363 724 358 687 326 Z" />
              <path className="geoWater" d="M773 367 C812 343 868 352 898 389 C852 405 809 398 773 367 Z" />
              <path className="geoLine" d="M454 136 C438 212 437 285 453 358" />
              <path className="geoLine" d="M567 148 C548 229 550 303 573 380" />
              <path className="geoLine" d="M684 151 C660 236 666 314 704 388" />
              <path className="geoLine" d="M794 170 C765 244 780 318 828 386" />
              <path className="geoLine" d="M305 322 C446 351 597 388 792 376" />
              <path className="geoLine" d="M365 412 C516 429 681 448 896 407" />
              <circle className="geoCity" cx="742" cy="313" r="5" />
              <circle className="geoCity" cx="700" cy="337" r="4" />
              <circle className="geoCity" cx="626" cy="360" r="4" />
              <circle className="geoCity" cx="528" cy="356" r="3.5" />
              <circle className="geoProviderHalo" cx="626" cy="360" r="28" />
              <circle className="geoProvider geoProviderLimited" cx="626" cy="360" r="11" />
              <text x="513" y="178">CANADA</text>
              <text x="356" y="250">ONTARIO</text>
              <text x="782" y="430">UNITED STATES</text>
              <text x="756" y="303" className="geoCityLabel">Toronto</text>
              <text x="638" y="350" className="geoCityLabel">Innisfil</text>
              <text x="713" y="330" className="geoCityLabel">Ottawa</text>
            </svg>
          </div>
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

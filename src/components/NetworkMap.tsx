"use client";

import Link from "next/link";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { initialViewForNodes, mappableNodes, STATUS_COLORS, type MappableNode } from "@/lib/locationResolver";
import { isProvisionableNode, statusLabel, type NetworkMapNode } from "@/lib/network";

export function NetworkMap({ nodes }: { nodes: NetworkMapNode[] }) {
  const markers = useMemo(() => mappableNodes(nodes), [nodes]);
  const initialViewState = useMemo(() => initialViewForNodes(markers), [markers]);
  const [selected, setSelected] = useState<MappableNode | null>(null);

  return (
    <section className="shell physicalMapSection" aria-label="Physical network map">
      <div className="sectionHeader mapSectionHeader">
        <div>
          <p className="eyebrow">Operator-Declared Location Map</p>
          <h2>Approximate sovereign node locations</h2>
          <p className="muted">
            Nodes appear only when operators publish public location metadata. Exact addresses and IP-derived locations are not used.
          </p>
        </div>
        <div className="mapKey">
          <span><i className="keyReady" /> Ready</span>
          <span><i className="keyLimited" /> Limited</span>
          <span><i className="keyDisabled" /> Disabled</span>
          <span><i className="keyOffline" /> Offline</span>
        </div>
      </div>

      {markers.length ? (
        <div className="physicalMapPanel">
          <Map
            initialViewState={initialViewState}
            mapStyle="https://demotiles.maplibre.org/style.json"
            cooperativeGestures
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
                />
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
                  <h3>{selected.node.displayName}</h3>
                  {selected.node.operator ? <p>Operator: {selected.node.operator}</p> : null}
                  <p>Location: {selected.node.location?.displayLocation || selected.label || "Approximate public location"}</p>
                  <p>Status: {statusLabel(selected.node.overallStatus)}</p>
                  <p>Commerce: {statusLabel(selected.node.services.commerce.status)}</p>
                  <p>Proofs: {statusLabel(selected.node.services.proofs.status)}</p>
                  <p>Provisionable: {isProvisionableNode(selected.node) ? "Yes" : "No"}</p>
                  <Link href={`/node/${encodeURIComponent(selected.node.nodeId)}`}>Review provider details</Link>
                </div>
              </Popup>
            ) : null}
          </Map>
        </div>
      ) : (
        <div className="panel emptyState">
          Eligible nodes will appear here once operators publish public location metadata.
        </div>
      )}
    </section>
  );
}

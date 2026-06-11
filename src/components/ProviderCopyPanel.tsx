"use client";

import { useState } from "react";
import type { NetworkMapNode } from "@/lib/network";

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const disabled = !value;
  return (
    <button
      className="copyButton"
      type="button"
      disabled={disabled}
      onClick={async () => {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="copyField">
      <span>{label}</span>
      <code>{value || "Not available"}</code>
      <CopyButton label={`Copy ${label}`} value={value} />
    </div>
  );
}

export function ProviderCopyPanel({ node, settingsUrl }: { node: NetworkMapNode; settingsUrl: string }) {
  const details = [
    `Provider URL: ${node.connect.providerCanonicalUrl || ""}`,
    `Provider Node ID: ${node.connect.providerNodeId || ""}`,
    `Provider Public Key: ${node.connect.providerPublicKey || ""}`,
    `Provider Profile ID: ${node.connect.providerProfileId || ""}`
  ].join("\n");

  return (
    <section className="panel copyPanel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Provider Connection</p>
          <h2>Connect to this Provider</h2>
        </div>
        <CopyButton label="Copy Provider Details" value={details} />
      </div>
      <p className="muted panelIntro">
        Paste these values into ContentBox Network Settings to connect your creator profile to this sovereign provider.
        ContentBox will verify the provider identity.
      </p>
      <div className="copyGrid">
        <Field label="Provider URL" value={node.connect.providerCanonicalUrl || ""} />
        <Field label="Node ID" value={node.connect.providerNodeId || ""} />
        <Field label="Public Key" value={node.connect.providerPublicKey || ""} />
        <Field label="Profile ID" value={node.connect.providerProfileId || ""} />
      </div>
      {settingsUrl ? (
        <a className="primaryAction" href={settingsUrl} target="_blank" rel="noreferrer">
          Open Network Settings
        </a>
      ) : null}
    </section>
  );
}

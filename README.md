# Certifyd Network Map

Canonical public discovery surface for eligible sovereign Certifyd node providers.

This app is not ContentBox and does not implement provider selection. It consumes public-safe registry data from the initial registry seed and gives creators the provider identifiers they can paste into ContentBox Network Settings.

Anyone may run a sovereign Certifyd node. `network.certifyd.me` only lists nodes that meet public map eligibility requirements, so creators see providers with valid public identity, reachable metadata, and usable provider connection details.

## Architecture Framing

### Genesis Node

`certifyd.beatifygroup.com` is the Genesis Sovereign Node. It is:

- the first sovereign provider node
- the initial registry seed
- a real provision-capable node
- one eligible node in the Certifyd Network

It is not "the network."

### Network Map

`network.certifyd.me` is the canonical Certifyd Network discovery surface. It is:

- the public discovery layer
- an interactive physical map and directory of eligible sovereign nodes
- a creator onboarding and provisioning directory
- a consumer of registry data

It is not itself a ContentBox node.

### Certifyd Ecosystem

The broader Certifyd ecosystem includes:

- `certifyd.me` landing page
- fan PWA
- `network.certifyd.me`
- future proof/trust explorer

## Routes

- `/` - public network map-ready directory
- `/join` - operator-facing eligibility preview and join path
- `/node/[nodeId]` - provider detail and copy panel

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_NETWORK_REGISTRY_URL=https://certifyd.beatifygroup.com
NEXT_PUBLIC_CONTENTBOX_NETWORK_SETTINGS_URL=https://certifyd.beatifygroup.com/dashboard/network
# Optional development/debug flag:
NEXT_PUBLIC_SHOW_INELIGIBLE_NODES=false
```

`NEXT_PUBLIC_NETWORK_REGISTRY_URL` points to the initial registry seed. For V1 this is the Genesis Sovereign Node at `https://certifyd.beatifygroup.com`.

The seed must expose:

- `GET /api/network/nodes`
- `GET /api/network/nodes/:nodeId`

## Map Eligibility

A node is map-eligible when it publishes:

- node ID
- provider node ID
- provider public key
- provider canonical URL
- identity service that is not disabled or offline
- reachable status of `ready` or `limited`
- no missing provider connection values

A node is provisionable when it is also provisioned as `ready` or `limited`, has at least one provider capability enabled, and has a provider canonical URL.

Non-eligible nodes are hidden by default. For local debugging, set:

```bash
NEXT_PUBLIC_SHOW_INELIGIBLE_NODES=true
```

## Physical Map Location

The homepage map uses operator-declared approximate public location metadata from ContentBox:

```ts
location: {
  country?: string;
  region?: string;
  city?: string;
  displayLocation?: string;
  precision?: "country" | "region" | "city";
  source?: "operator_declared" | "browser_confirmed";
}
```

The Network Map does not geolocate visitors or node operators. It does not use IP geolocation, does not infer private location, and does not show exact home locations.

Markers represent approximate public areas. Multiple nodes in the same area are grouped together. Markers do not represent exact node addresses.

For V1, ContentBox publishes location text only. `network.certifyd.me` resolves approximate display coordinates with a small local lookup table for known public locations:

- Innisfil, Ontario, Canada
- Simcoe County, Ontario, Canada
- Ontario, Canada
- Canada

The map intentionally resolves only safe public-area coordinates from declared location text. Multiple nodes that share the same public display area are shown as a single cluster marker with a count, and the popup lists every provider in that area.

## Apply to Join the Network

`/join` is the first operator-facing admission flow for `network.certifyd.me`.

The flow is:

1. Run Node
2. Meet Requirements
3. Submit Node
4. Eligibility Check
5. Become Discoverable

V1 does not create accounts, store submissions, or write to a database. It gives operators a public eligibility preview by asking for a provider canonical URL, fetching:

```text
{providerUrl}/api/network/nodes
```

The client-side checker reads the returned nodes, matches the submitted provider URL against `connect.providerCanonicalUrl` when possible, then applies the same map eligibility and provisionability helpers used by the public directory.

### Current V1 Join Path

1. Run a ContentBox sovereign node.
2. Configure a public canonical URL.
3. Enable provider capability.
4. Publish node identity and public key.
5. Expose `/api/network/nodes`.
6. Add the node URL to the seed registry for discovery.

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Validation

```bash
npm run build
npm run lint
npm audit
```

## Security Model

The site displays only public-safe provider data:

- Provider URL
- Provider Node ID
- Provider Public Key
- Provider Profile ID
- service/readiness/trust status
- public-safe reason codes
- operator-declared approximate public location

It must never display or request:

- wallet balances
- channel balances
- channel IDs
- peer addresses
- invoices
- payment hashes
- macaroons
- TLS certificates
- REST endpoints
- local ports
- payout destinations
- exact addresses
- exact private coordinates
- IP-derived location
- private infrastructure details

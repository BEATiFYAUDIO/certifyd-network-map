# Certifyd Network Map

Public discovery surface for sovereign Certifyd node providers.

This app is not ContentBox and does not implement provider selection. It reads public-safe node registry data from ContentBox and gives creators the provider identifiers they can paste into ContentBox Network Settings.

## Routes

- `/` - public network map-ready directory
- `/node/[nodeId]` - provider detail and copy panel

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_NETWORK_REGISTRY_URL=https://certifyd.beatifygroup.com
NEXT_PUBLIC_CONTENTBOX_NETWORK_SETTINGS_URL=https://certifyd.beatifygroup.com/dashboard/network
```

`NEXT_PUBLIC_NETWORK_REGISTRY_URL` must point to a ContentBox node exposing:

- `GET /api/network/nodes`
- `GET /api/network/nodes/:nodeId`

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
```

## Security Model

The site displays only public-safe provider data:

- Provider URL
- Provider Node ID
- Provider Public Key
- Provider Profile ID
- service/readiness/trust status
- public-safe reason codes

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
- private infrastructure details

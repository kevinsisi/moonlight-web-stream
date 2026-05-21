# Moonlight Web AI Handoff

This repo contains the full Moonlight Web source code plus deployment notes for the current HomeProject setup.

## Current Reference Deployment

- Service: Moonlight Web Stream
- Container image: `mrcreativ3001/moonlight-web-stream:latest`
- Container name: `moonlight-web`
- Web port: `60000/tcp`
- WebRTC UDP range: `60001-60101/udp`
- Current HomeProject domain: `https://moonlight.sisihome.org`
- Current HomeProject upstream without domain: `http://100.83.112.20:60000`
- Persistent server data: Docker volume `moonlight-server` mounted at `/moonlight-web/server`

## Mandatory Preflight: Check Port Conflicts First

Do this before starting or changing the service on any server. Do not assume `60000` is free.

Windows PowerShell:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 60000
docker ps --format "{{.Names}} {{.Ports}}"
netsh int ipv4 show excludedportrange protocol=tcp
netsh int ipv4 show excludedportrange protocol=udp
```

Expected for an unused web port: `TcpTestSucceeded : False` for `60000`.

Linux:

```sh
ss -ltnup | grep -E ':(60000|6000[1-9]|600[1-9][0-9]|6010[0-1])\b' || true
docker ps --format '{{.Names}} {{.Ports}}'
```

If any selected port is in use, choose another web port and an unused UDP range. Keep the WebRTC range consistent between Docker port publishing and `WEBRTC_PORT_RANGE`.

## Start Without A Domain

Use this when the next maintainer does not have DNS or a reverse proxy yet.

1. Install and start Sunshine on the streaming PC.
2. Copy or use this repo on the server where Moonlight Web will run.
3. Edit `deploy/docker-compose.yml` only if the default ports conflict.
4. Set `MOONLIGHT_NAT_HOST` to the server IP that phones/browsers can reach.
5. Start the service.

Windows PowerShell example:

```powershell
$env:MOONLIGHT_NAT_HOST = "SERVER_IP"
docker compose -f deploy/docker-compose.yml up -d
```

Linux/macOS example:

```sh
MOONLIGHT_NAT_HOST=SERVER_IP \
docker compose -f deploy/docker-compose.yml up -d
```

If this service should bind only to one interface, also set `MOONLIGHT_BIND_IP` before starting. The current HomeProject deployment uses the Tailscale IP as both values:

```powershell
$env:MOONLIGHT_BIND_IP = "100.83.112.20"
$env:MOONLIGHT_NAT_HOST = "100.83.112.20"
docker compose -f deploy/docker-compose.yml up -d
```

6. Open Moonlight Web directly:

```text
http://SERVER_IP:60000
```

For same-machine testing, use:

```text
http://localhost:60000
```

The first login creates the admin user. There is no default username or password.

## Sunshine Host Setup

When adding a PC in Moonlight Web, use an address the container can reach.

Do not use `localhost` unless Sunshine is inside the same container. If Sunshine is on the Docker host, use the host LAN, Tailscale, or public IP.

Common Sunshine ports:

- Web UI: `https://localhost:47990`
- HTTP / API: `47989`
- HTTPS / pairing: `47984`
- RTSP: `48010`
- UDP streaming: `47998-48000`

If Sunshine is on the same Windows host as the current HomeProject deployment, the working host address was `192.168.18.88` during pairing.

## Optional Domain / Reverse Proxy

The service does not require a domain. A domain only makes the URL nicer and enables normal HTTPS browser behavior.

Caddy example:

```caddy
moonlight.example.com {
    reverse_proxy SERVER_IP:60000 {
        flush_interval -1
        transport http {
            read_timeout 24h
            write_timeout 24h
            dial_timeout 5s
        }
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

Important: the reverse proxy only handles the web UI. For WebRTC over networks, the browser must still be able to reach the server's advertised UDP ports, or you must configure TURN / WebSocket fallback according to the upstream README.

## Current HomeProject Caddy Mapping

On the HomeProject RPi Caddy host, the active mapping is:

```caddy
@moonlight host moonlight.sisihome.org
handle @moonlight {
    reverse_proxy 100.83.112.20:60000 {
        flush_interval -1
        transport http {
            read_timeout 24h
            write_timeout 24h
            dial_timeout 5s
        }
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

## Build From Source

For normal deployment, prefer Docker Compose with the release image. Building this repo locally requires:

- Rust nightly from `rust-toolchain.toml`
- Node.js and npm
- OpenSSL development files available to Rust
- Git submodules if upstream adds any required submodule content

Frontend build:

```sh
npm install
npm run build
```

Rust build on Windows can use the helper:

```powershell
.\build-windows.ps1 --release
```

If `npm run build` fails because `web/api_bindings.*` is missing, generate bindings with the Rust command used by `package.json`:

```sh
cargo test export_bindings --package common
```

## Operations

Check status:

```sh
docker ps --filter name=moonlight-web
docker logs --tail 100 moonlight-web
```

Stop:

```sh
docker compose -f deploy/docker-compose.yml down
```

Remove the persisted data only when intentionally resetting users, pairing, and config:

```sh
docker volume rm moonlight-server
```

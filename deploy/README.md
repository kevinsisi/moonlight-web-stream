# Deploy Moonlight Web

This compose file starts Moonlight Web from the upstream release image while this repository keeps the full source code available for maintenance.

Before running it, read `../AI_HANDOFF.md`.

Minimum startup:

```sh
MOONLIGHT_NAT_HOST=SERVER_IP docker compose -f deploy/docker-compose.yml up -d
```

If there is no domain or reverse proxy, open:

```text
http://SERVER_IP:60000
```

Always confirm `60000/tcp` and `60001-60101/udp` are unused before deployment. If they conflict, choose a different web port and UDP range and keep Docker port publishing aligned with `BIND_ADDRESS` and `WEBRTC_PORT_RANGE`.

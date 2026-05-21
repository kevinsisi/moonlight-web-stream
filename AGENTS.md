# Moonlight Web Stream — OpenCode Rules

This fork is maintained as part of Kevin's HomeProject environment.

## Rule Sources

- Before development work, locate and read `homelab-docs`.
- Preferred local path: `D:\GitClone\_HomeProject\homelab-docs`.
- Required rule files for non-trivial work:
  - `homelab-docs/AGENTS.md`
  - `homelab-docs/AGENT_RULES.md`
  - `homelab-docs/docs/opencode-development-guidelines.md`
  - `homelab-docs/kevin-ai-persona/PERSONA.md`
- For UI work, also read `homelab-docs/skills/frontend-design/SKILL.md` and `homelab-docs/skills/plan-before-build/SKILL.md`.

## Project Priorities

1. Streaming stability.
2. iPhone/PWA usability.
3. Traditional Chinese HomeProject UI.
4. Build/deploy reproducibility.

## High-Risk Areas

- Do not casually modify `web/stream*`, `web/stream/**`, input mapping, gamepad mapping, WebRTC/WebSocket transport, video/audio decode, or stream launch behavior.
- If a task touches stream runtime behavior, verify with an actual stream smoke test before calling it complete.
- Keep service worker changes conservative: never cache `/api/*`, stream traffic, or session-sensitive responses.

## UI Refactor Direction

- Planning source: `docs/ui-refactor-plan.md`.
- First-class UI language target: Traditional Chinese (`zh-TW`).
- Do not remove existing `zh-CN` support unless explicitly requested.
- Prefer small, reversible UI phases over a full rewrite.

## Build Notes

- Run `npm run build` before handing off product-code changes.
- On Windows, `npm run generate-bindings` uses Docker/Linux via `scripts/generate-bindings.js` to avoid local MSVC/OpenSSL build issues.
- Docker must be available for the full Windows build path.

## Deployment Context

- Live domain: `https://moonlight.sisihome.org`.
- Direct URL: `http://100.83.112.20:60000`.
- Live container: `moonlight-web` on kevinhome.
- WebRTC UDP range: `60001-60101`.

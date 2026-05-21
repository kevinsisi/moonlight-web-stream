# Moonlight Web Custom UI + Traditional Chinese Plan

This document prepares the custom HomeProject UI refactor for `moonlight-web-stream` without changing streaming internals yet.

## Goals

- Make the shell UI feel like a first-party HomeProject app instead of a lightly themed upstream Moonlight page.
- Add first-class Traditional Chinese (`zh-TW`) copy for the main workflow, settings, admin, host actions, game actions, and stream controls.
- Keep game streaming reliability as the highest constraint: UI refactors must not change video, audio, WebRTC, WebSocket, input, gamepad, keyboard, mouse, or touch transport behavior unless the change is explicitly scoped and tested.
- Preserve iPhone/PWA usability: no login regression, no viewport crop regression, no input zoom/layout jump in forms.

## Current Architecture Snapshot

- Frontend is frameworkless TypeScript that builds DOM components manually under `web/`.
- Main app shell is `web/index.ts` with views for hosts, games, and settings.
- Host and game tiles are in `web/component/host/*` and `web/component/game/*`.
- Settings UI and persisted `mlSettings` are in `web/component/settings_menu.ts` and `web/default_settings.ts`.
- Stream page and runtime controls live under `web/stream*`; treat this as high risk.
- Styling is split between `web/styles/standard.css` and `web/styles/moonlight.css`, selected by `pageStyle`.
- i18n canonical type is `web/locales/en.ts`; available languages are wired in `web/i18n.ts`.
- Existing Chinese locale is simplified Chinese only: `web/locales/zh-CN.ts`.

## HomeProject Rules Applied

- UI language should default toward Traditional Chinese for custom HomeProject surfaces.
- Mobile inputs must use at least `16px` font size and must be tested on iOS/PWA login/settings forms.
- Avoid generic AI aesthetics; choose a distinct visual language.
- Product UI should expose a version in the header before the next user-facing redesign ships.
- Non-trivial redesign should be planned before product code changes.
- This repo currently has no OpenSpec initialized, so the first implementation phase should either add a lightweight repo-local design doc only or initialize OpenSpec before larger product changes.

## Proposed Design Direction

Tone: industrial console, optimized for sofa/mobile control.

- Dark graphite base, not pure black.
- Single strong accent: moonlit cyan/green, used sparingly for active/ready state.
- Dense but touch-friendly cards: host and app tiles should show key state without requiring context menu discovery.
- Typography: system CJK stack initially for compatibility; later evaluate a bundled Traditional Chinese display font only if asset size remains acceptable.
- Motion: minimal operational feedback, not decorative animation. Streaming launch and pairing states should be clear and cancellable when possible.

## Scope Boundaries

In scope for phase 1:

- `zh-TW` locale wiring and complete Traditional Chinese copy.
- Default language option and label cleanup without removing existing `zh-CN`.
- Main app shell visual refresh: header, actions, host list, app grid, settings layout, login modal, notifications.
- Version display in the main header.
- PWA-safe CSS improvements for shell pages.

Out of scope for phase 1:

- Rewriting stream transport, codecs, decoders, input event mapping, gamepad mapping, or WebRTC signaling.
- Changing backend API contracts.
- Replacing the frameworkless frontend with React/Vite.
- Changing deployment ports, Caddy routes, Docker networking, or persisted server data.

## Suggested Implementation Phases

1. Foundation
   - Add `zh-TW` locale and language option.
   - Add visible app version source and header display.
   - Add CSS variables for the new HomeProject visual system without removing current class names.
   - Verify `npm run build`.

2. Main Shell
   - Refactor header/actions markup only enough to support clearer layout.
   - Improve host tile state labels and touch targets.
   - Keep context menus as secondary power-user actions.
   - Verify desktop and iPhone PWA layout.

3. Game Launcher
   - Improve game grid density, active session state, and launch/resume/stop affordances.
   - Keep `startStream()` behavior unchanged.
   - Verify launch still opens current tab in PWA and new tab in browser.

4. Settings/Admin
   - Group settings into clearer Traditional Chinese sections.
   - Keep persisted settings keys unchanged.
   - Check input zoom and safe-area behavior on mobile.

5. Stream Overlay Polish
   - Only after phases 1-4 are stable, restyle stream controls/logs without changing input or transport behavior.
   - Any stream change must include manual smoke testing with keyboard/mouse/touch/controller scenarios.

## Verification Plan

- Build: `npm run build`.
- Static checks: generated `web/api_bindings.ts` exists and `dist/` updates.
- Desktop smoke: login, host list, add host modal, settings language switch, admin navigation.
- iPhone/PWA smoke: fresh PWA login, relaunch from home screen, settings input focus, stream page viewport containment.
- Stream smoke before release: launch game, exit stream, reconnect, touch mode, mouse mode, controller where available.

## Open Questions

- Should `zh-TW` become the default language for this fork, or only be selectable first in the language list?
- Should the new visual style replace `standard`, or be added as a new `homeproject` page style first for safer rollback?
- Should versioning stay at root `package.json`, or add a dedicated `web/version.ts` so the UI can show a fork-specific version such as `1.1.0-home.0`?
- Should phase 1 initialize OpenSpec in this repo before product code changes, or keep this Markdown plan as the planning source for now?

# Hollow — Privacy & Data Handling

**Last updated: 2026-04-26.**

This is the human-readable promise behind Hollow's data handling. It is not boilerplate copy-pasted from a generator. If anything below ever stops being true, this file changes the same day.

---

## The short version

Hollow stores your fasts, achievements, hydration, and preferences **on your device only**. Nothing is sent anywhere. There is no account, no login, no telemetry, no analytics, no crash reporter, no "anonymous usage stats", and no third-party SDK that phones home.

Your data is yours. Hollow can read it because it lives in a JSON file you can open with any text editor, and you can export or delete it at any time from Settings → Data.

---

## What Hollow stores, and where

| Data | Where on disk |
|---|---|
| Fasting history (every completed fast: start, end, duration, protocol, mood) | `hollow-data.json` |
| XP, level, rank, streak, unlocked achievements | `hollow-data.json` |
| Hydration log (daily glasses) | `hollow-data.json` |
| Preferences (theme, sound, notification toggles, protocol) | `hollow-data.json` |
| Window position (desktop only) | `hollow-data.json` |

Path on each platform:

- **Windows:** `%APPDATA%\com.hollow.fasting-widget\hollow-data.json`
- **macOS:** `~/Library/Application Support/com.hollow.fasting-widget/hollow-data.json`
- **Linux:** `~/.local/share/com.hollow.fasting-widget/hollow-data.json`
- **Android:** the app's private data directory (only Hollow can read it)
- **iOS:** the app sandbox (only Hollow can read it)

You can copy that file as a backup at any time. Hollow's built-in "Export" button (Settings → Data) gives you the same JSON in a portable form.

---

## What Hollow does NOT do

- **No accounts.** There is nothing to sign up for.
- **No cloud sync.** Your data does not leave your device.
- **No analytics.** We don't know how often you fast, what protocols you use, or even whether you've ever opened the app.
- **No crash reporting.** If Hollow crashes, only you see it.
- **No third-party SDKs.** No Sentry, no Mixpanel, no Firebase, no Google Analytics, no Facebook Pixel — none of it.
- **No advertising.** Hollow does not show ads and does not embed any ad SDK.
- **No A/B testing.** Every install runs the same code.
- **No background data collection.** When the app is closed it does nothing.

If we ever change any of these (e.g. add opt-in cloud sync), the change will be:

1. Off by default. You will have to explicitly turn it on.
2. Documented in this file, in the changelog, and in the app itself.
3. Reversible — you can turn it back off and Hollow will delete what was synced.

---

## Network access

**Hollow makes zero outbound network requests during normal operation.** The app does not include an HTTP client, a websocket, or any networked SDK. Geist Sans + Geist Mono are bundled with the app via `@fontsource/geist*` — no Google Fonts CDN, no `fonts.googleapis.com` request at any point.

The only future exception will be the Tauri auto-updater, which (when configured — it isn't yet, see `RELEASE-CHECKLIST.md`) will make a single request on launch to the public release endpoint to check version metadata. The auto-updater can be disabled. As of this writing, Hollow makes zero outbound requests, period.

If you intercept the WebView's traffic with mitmproxy or Wireshark and see Hollow phone home, that's a bug — open a `[Bug]` issue immediately.

---

## Permissions

### Desktop
- **Filesystem read/write to its own data directory** (to save your fasting history)
- **Always-on-top window** (when you enable it in Settings)
- **System tray icon** (so the widget can hide / re-show without quitting)

That's it. Hollow does not request access to your microphone, camera, contacts, calendar, files outside its own directory, location, or notifications (notification permissions will be requested in a future release if/when scheduled-notifications are added — and only with your consent).

### Mobile (when shipped)
- **Storage** for the same reason as desktop.
- **Notification permission** (future) for pre-stage and break-fast reminders. Opt-in.

---

## Your data, your control

In Settings → Data you can:

- **Export** — download a JSON file containing every fast, achievement, hydration record, streak, and preference. Open it in any text editor.
- **Import** — replace your current state with the contents of an exported JSON file.
- **Reset All Data** — wipe everything from `hollow-data.json` permanently. This is local — there is no copy elsewhere to fall back on.

If you uninstall Hollow, the OS handles the data directory per its usual rules:

- **Windows / macOS / Linux:** `%APPDATA%` / `Library/Application Support/` / `~/.local/share/` directories often persist after uninstall. Delete `com.hollow.fasting-widget/` manually if you want a clean wipe.
- **Android / iOS:** uninstalling the app removes its sandboxed data automatically.

---

## Children

Hollow does not knowingly collect data from anyone, period. Including children.

---

## Changes

If this policy changes in any way that is meaningful to a user, the version number on this file bumps and the change appears in `CHANGELOG.md`. Trivial typo fixes don't count.

---

## Questions

There is no contact form because there is no data to ask about. If you find something in the app that contradicts this document, open a GitHub issue — the discrepancy is the bug, this file is the spec.

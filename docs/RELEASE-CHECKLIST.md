# Hollow — Release Checklist

The hand-off between "code looks good locally" and "first user has installed v1.x.x" is fragile. This checklist is the single source of truth for that hand-off. Run it top-to-bottom every release. Skipping a step is how broken builds reach users.

---

## Before any release work begins

- [ ] On `main`, working tree clean. `git status` shows nothing pending.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` clean. JS gzipped < 200 KB, CSS gzipped < 12 KB (drift past these means a dependency snuck in — investigate).
- [ ] CI green on the latest commit (`.github/workflows/ci.yml`).
- [ ] **`npm run health`** is green. This single command runs typecheck + Vite build + four architectural pattern scans (no stray fasting-clock `setInterval`, no direct `@tauri-apps/api/window` imports outside `src/platform/desktop/`, no `z-[N]` / `z-NN` / `rounded-2xl/xl/lg`, no `useStore()` without selector). The scans are pure JS so they work identically on Windows / macOS / Linux / CI.

---

## 1. Version bump

- [ ] Decide release type per [SemVer](https://semver.org/): patch / minor / major.
- [ ] Update `package.json` `version`.
- [ ] Update `src-tauri/Cargo.toml` `version` to match.
- [ ] Update `src-tauri/tauri.conf.json` `version` to match.
- [ ] Update `CHANGELOG.md`: move "Unreleased" entries under a new dated heading.

> All four versions stay in lockstep. If `package.json` says 1.1.0 and `tauri.conf.json` says 1.0.0, the Windows installer's "About" dialog will mislead users.

---

## 2. Smoke test the desktop app

Pick the OSes you actually ship to.

- [ ] **Windows:** `npm run tauri build` — produces `src-tauri/target/release/bundle/nsis/Hollow_<ver>_x64-setup.exe`. Install on a clean profile (or VM). Verify:
  - [ ] App launches from Start Menu
  - [ ] Onboarding completes, lands on main panel
  - [ ] A 1-min test fast starts → ends → appears in Stats
  - [ ] Pill mode toggle resizes window
  - [ ] Always-on-top works
  - [ ] Right-click menu opens; close hides app, tray re-shows
  - [ ] Theme toggle: light → dark → light renders correctly
  - [ ] Data export: file downloads, opens as readable JSON
  - [ ] Data import: round-trip restores state
  - [ ] Uninstaller works from Apps & Features
- [ ] **macOS:** `npm run tauri build` on macOS host. `.dmg` install on clean profile, same checks above.
- [ ] **Linux:** `npm run tauri build` on Linux host. AppImage runs on clean profile.

---

## 3. Smoke test the Android APK

- [ ] `npm run android:build` produces `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`.
- [ ] For release: rebuild without `--debug` and **sign** the release APK with the keystore (see "Signing keystore" below).
- [ ] Install on a real Pixel-class device (not just emulator).
- [ ] Onboarding completes (touch input was historically the blocker — verify BEGIN button taps register).
- [ ] Background → foreground keeps an in-progress fast (tests focus-recovery on mobile).
- [ ] Rotate device — layout doesn't break.
- [ ] No window-management buttons render (mobile-aware title bar).

> iOS release is gated on Phase 7 (mobile UI). Until then, no IPA shipping.

---

## 4. Signing keystore (Android, release-only)

- [ ] Generate a keystore once and store it OUT OF the repo:
  ```bash
  keytool -genkey -v -keystore hollow-release.keystore \
    -alias hollow -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Document the keystore path + alias + password in your password manager. **Never commit the keystore.**
- [ ] Configure `src-tauri/gen/android/app/build.gradle.kts` `signingConfigs.release` with keystore path + alias + key password (read from environment, not hard-coded).
- [ ] Verify the signed APK with `apksigner verify --verbose <signed-apk>`.

---

## 5. Tag + push

- [ ] `git add -A && git commit -m "Release v<ver>"`
- [ ] `git tag -a v<ver> -m "v<ver>"`
- [ ] `git push origin main --tags`

---

## 6. Cut the GitHub Release

- [ ] Open `https://github.com/<org>/hollow/releases/new`, select the new tag.
- [ ] Title: `Hollow v<ver>`
- [ ] Body: paste the matching `CHANGELOG.md` section.
- [ ] Attach binaries: `Hollow_<ver>_x64-setup.exe`, `Hollow_<ver>_x64.dmg`, `Hollow_<ver>_amd64.AppImage`, `app-release.apk`.
- [ ] Mark as "Latest release". Publish.

---

## 7. Store submissions (when applicable)

- [ ] **Microsoft Store** (Windows): submit MSIX via Partner Center. Requires Windows publisher account.
- [ ] **Mac App Store**: notarize the .app, submit through App Store Connect. Requires Apple Developer Program.
- [ ] **Google Play**: upload the signed AAB (not APK) to Play Console internal track first; promote to production after 24h soak.
- [ ] **App Store** (iOS): blocked on Phase 7.

Each store has its own metadata pipeline (screenshots, privacy disclosure, age rating). Keep a per-store checklist in `docs/store/` once first submission lands.

---

## 8. Post-release verification

Within 24 hours of a public release:

- [ ] Download the published binary from the release page (NOT your dev build) and install on a fresh profile.
- [ ] Check that auto-update (if configured) detects the new version from a previously-installed older version.
- [ ] Watch the issue tracker for crash reports for 48 hours before starting next-version work.

---

## Rollback plan

If a release is found broken in the wild within 24 hours:

1. Mark the GitHub Release as a "Pre-release" (not "Latest") so the previous one wins again.
2. If a store rollback exists (Play Console "Halt rollout"), trigger it immediately.
3. Open a `v<ver>.1` patch branch from the release tag, fix, repeat this checklist.

Never delete a published release tag — it breaks installed-version reporting. Always patch forward.

---

## Things this checklist intentionally does NOT cover

- Marketing announcements / blog posts / social
- Pricing changes
- Customer-support runbooks

Those belong elsewhere. This file is the technical hand-off only.

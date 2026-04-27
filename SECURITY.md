# Security Policy

## Reporting a vulnerability

If you find a security vulnerability in Hollow:

1. **Do not open a public issue.** Public reports for unfixed vulnerabilities are how users get hurt.
2. Open a [GitHub Security Advisory](https://github.com/wolverinetole/hollow/security/advisories/new) — the maintainer will see it privately and respond.
3. If GitHub Security Advisories are unavailable to you, open a **private** issue with the title `[security]` and no body, then wait for a maintainer to follow up via email.

## What counts as a vulnerability in Hollow

Hollow is a local-only desktop / mobile app. The realistic attack surfaces are narrower than for a web app:

| Attack surface | What we treat as a vulnerability |
|---|---|
| Tauri command surface (`invoke`) | Any way to call a privileged operation we didn't intend to expose |
| Persistence (`hollow-data.json`) | A way for one fast / one user state to corrupt another's, or for malformed input to crash the app on next launch |
| Auto-updater (when shipped) | Anything that could install an unsigned or downgraded build |
| Filesystem access | Any path traversal — Hollow should only ever read/write inside its app-data dir |
| Build pipeline | Compromised dependency or signing key |

What we **don't** treat as vulnerabilities:

- Cosmetic CSS issues
- Performance complaints
- Feature requests dressed as security concerns
- "I can read my own `hollow-data.json` with a text editor" — this is by design, not a leak (see `docs/PRIVACY.md`)

## Response timeline

- **Within 48 hours:** acknowledge receipt
- **Within 7 days:** confirm severity assessment and rough fix timeline
- **Coordinated disclosure:** we'll work with you on a public-disclosure date once a fix is in place

## Hall of fame

We'll credit researchers in the `CHANGELOG.md` for the release that contains the fix, unless you'd rather stay anonymous.

## Supported versions

Only the latest minor release receives security fixes. If you're on an older version, please update before reporting; a fix may already exist.

| Version | Supported |
|---|---|
| 1.x.x   | ✅ |
| < 1.0   | ❌ (development) |

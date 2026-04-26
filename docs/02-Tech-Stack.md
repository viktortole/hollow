# Technology Stack

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Windows OS                     │
│  ┌─────────────────────────────────┐    │
│  │  Hollow.exe (NSIS installer)    │    │
│  └──────────────┬──────────────────┘    │
│                 │                        │
│         ┌───────┴───────┐               │
│         │               │               │
│  ┌──────▼──────┐  ┌────▼──────────┐   │
│  │   Tauri      │  │ System Tray   │   │
│  │   Runtime    │  │  (Rust)       │   │
│  │  (Rust 2.x)  │  └───────────────┘   │
│  │              │                       │
│  │  - Window    │                       │
│  │  - Tray      │                       │
│  │  - FS plugin │                       │
│  │  - Store     │                       │
│  └──────┬───────┘                       │
│         │ IPC                           │
│  ┌──────▼───────┐                       │
│  │ WebView2     │                       │
│  │ (Edge-based) │                       │
│  │              │                       │
│  │  React 19    │                       │
│  │  Zustand 5   │                       │
│  │  Framer 12   │                       │
│  │  Tailwind 4  │                       │
│  └──────────────┘                       │
└─────────────────────────────────────────┘
```

---

## Frontend Dependencies (`package.json`)

### Core Framework
```json
"react": "^19.1.0",
"react-dom": "^19.1.0",
"typescript": "~5.8.3"
```

### Tauri Integration
```json
"@tauri-apps/api": "^2",
"@tauri-apps/plugin-fs": "^2.5.0",
"@tauri-apps/plugin-opener": "^2",
"@tauri-apps/plugin-store": "^2.4.2",
"@tauri-apps/cli": "^2"
```

### UI & Animation
```json
"framer-motion": "^12.38.0",
"lucide-react": "^1.11.0"
```

### Styling
```json
"tailwindcss": "^4.2.4",
"@tailwindcss/vite": "^4.2.4"
```

### State Management
```json
"zustand": "^5.0.12"
```

### Bundler
```json
"vite": "^7.0.4",
"@vitejs/plugin-react": "^4.6.0"
```

---

## Backend Dependencies (`src-tauri/Cargo.toml`)

```toml
[package]
name = "hollow"
version = "1.0.0"
edition = "2021"

[lib]
name = "hollow_lib"
crate-type = ["staticlib", "cdylib", "rlib"]   # multi-type for Tauri

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-opener = "2"
tauri-plugin-store = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
log = "0.4"
```

### Crate Explanations

| Crate | Purpose |
|-------|---------|
| `tauri` | Core framework. Handles window creation, IPC, app lifecycle |
| `tauri-plugin-opener` | Opens URLs in browser (used for links) |
| `tauri-plugin-store` | JSON key-value persistence |
| `tauri-plugin-fs` | File system access |
| `serde` + `serde_json` | Rust struct serialization/deserialization |
| `log` | Logging facade (noop unless a logger is configured) |

---

## Build System

### Vite (`vite.config.ts`)
- **Port:** 1420 (hardcoded in `tauri.conf.json` devUrl)
- **HMR:** WebSocket-based hot module replacement
- **Watch ignore:** `src-tauri/**` (Rust changes require recompile)
- **Tailwind:** Uses `@tailwindcss/vite` plugin (v4 CSS-first config)
- **Dev host:** Respects `TAURI_DEV_HOST` env var for remote dev

### Tauri (`tauri.conf.json`)
- **Product name:** `Hollow`
- **Bundle targets:** `nsis` (Windows installer)
- **Install mode:** `currentUser` (per-user, no admin required)
- **CSP:** `null` (no Content Security Policy restrictions)

### Rust Build (`build.rs`)
- Calls `tauri_build::build()` — standard Tauri 2 build hook

---

## Frontend Build Output

```
dist/
├── index.html          # Entry HTML
├── assets/
│   ├── index-*.css    # Tailwind compiled CSS
│   └── index-*.js     # React bundle (code-split)
├── tauri.svg          # App icon (SVG)
└── vite.svg           # Vite logo
```

---

## Key API Versions

| Tool | Version | Notes |
|------|---------|-------|
| Tauri CLI | 2.x | `npm run tauri` commands |
| Tauri Runtime | 2.x | Core framework |
| React | 19.1.x | Latest stable React 19 |
| Zustand | 5.0.12 | React 19 compatible |
| Framer Motion | 12.38.0 | Latest |
| Tailwind CSS | 4.2.4 | CSS-first config model |
| TypeScript | 5.8.x | Strict mode enabled |
| Vite | 7.x | Latest |
| Lucide React | 1.11.x | Tree-shakeable icons |

---

## Tauri 2 Permission Model

Hollow uses Tauri 2's capability system for permissions. The `default.json` capability file explicitly allows:

### Window Permissions
```json
"core:window:allow-close",       // close button (app.exit)
"core:window:allow-minimize",     // minimize (not used directly)
"core:window:allow-maximize",     // maximize (not used)
"core:window:allow-unmaximize",   // unmaximize (not used)
"core:window:allow-set-always-on-top",  // toggle AOT
"core:window:allow-start-dragging",    // custom drag region
"core:window:allow-set-size",     // resize (not used directly)
"core:window:allow-set-position", // move (not used)
"core:window:allow-outer-position",
"core:window:allow-outer-size",
"core:window:allow-set-focus",
"core:window:allow-hide",
"core:window:allow-show",
"core:window:allow-is-maximized"
```

### Tray & Menu
```json
"core:tray:allow-set-icon",
"core:tray:default",
"core:menu:default"
```

### Plugins
```json
"opener:default",   // tauri-plugin-opener
"store:default",    // tauri-plugin-store
"fs:default",       // tauri-plugin-fs
"global-shortcut:default"  // registered but not yet used
```

---

## File Locations

| File | Purpose |
|------|---------|
| `~/.tauri/hollow-data.json` | Persisted app state (OS-managed path) |
| `src-tauri/icons/icon.ico` | System tray + executable icon |
| `dist/` | Built frontend (served by Tauri at runtime) |
| `src-tauri/target/` | Rust compilation output |

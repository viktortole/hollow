# Build, Run & Debug Guide

## Development Workflow

### Prerequisites
- Node.js 18+ (for npm)
- Rust 1.70+ (for Tauri)
- Windows 10/11 (Hollow is Windows-only)

### Installing Rust

```bash
# Via rustup (recommended)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or on Windows: download rustup-init.exe from https://rustup.rs
```

Verify installation:
```bash
rustc --version  # should be 1.70+
cargo --version
```

### Frontend Development (No Rust)

```bash
cd /mnt/c/Users/ToleV/Desktop/Hollow
npm install       # first time only
npm run dev       # starts Vite dev server on port 1420
```

This runs only the frontend (React) with Vite's dev server. No Tauri backend, no tray icon.

### Full Tauri Development

```bash
cd /mnt/c/Users/ToleV/Desktop/Hollow
npm install       # first time only
npm run tauri dev # starts Tauri + WebView2 + Vite
```

This:
1. Compiles the Rust backend (`src-tauri/`)
2. Starts the Vite dev server (port 1420)
3. Launches the Tauri application with a WebView2 window
4. Opens hot module replacement (HMR) for frontend changes
5. Rebuilds Rust only when `src-tauri/` files change

**First run:** Expect a slow compile (~30-60s for Rust). Subsequent runs are faster.

### Build for Production

```bash
npm run tauri build
```

Outputs:
- `src-tauri/target/release/hollow.exe` — standalone executable
- `src-tauri/target/release/bundle/nsis/*.exe` — NSIS installer

---

## Running the Built App

### Standalone EXE
```
src-tauri/target/release/hollow.exe
```

### Installer
```
src-tauri/target/release/bundle/nsis/Hollow_1.0.0_x64-setup.exe
```

The installer places the app in:
```
%LOCALAPPDATA%\Programs\Hollow\
```

And creates a Start Menu shortcut. The app runs on login (if configured in NSIS).

---

## Debugging

### Frontend Debugging (React)

1. Open the app
2. Right-click anywhere in the widget
3. Select "Inspect Element" or press F12 (if devtools are enabled in tauri.conf.json)

Or add `"debug": true` to the Tauri devtools config.

### Rust Debugging

```bash
# Run with verbose output
RUST_LOG=debug npm run tauri dev

# Or attach VS Code debugger
# .vscode/launch.json should have a Tauri debug config
```

### State Inspection

Open the browser devtools and in the console:
```javascript
// Access the Zustand store
// (store is not exposed globally — add a temporary global for debugging)
```

### Log Output

The Rust side uses the `log` crate. Add logging:
```rust
log::info!("Message");
log::error!("Error: {}", err);
```

---

## File Locations

| What | Where |
|------|-------|
| State persistence | OS-managed (tauri-plugin-store), typically `%APPDATA%\com.hollow.fasting-widget\` |
| App logs | Not configured (log crate is a no-op without a logger) |
| Installed exe | `%LOCALAPPDATA%\Programs\Hollow\` |
| NSIS installer | `src-tauri/target/release/bundle/nsis/` |
| Vite dev server | `http://localhost:1420` |
| Frontend source | `src/` |
| Rust source | `src-tauri/src/` |

---

## Common Build Issues

### "Failed to run tauri build: no default toolchain"

```bash
rustup default stable
```

### WebView2 not found (Windows)

Download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

WebView2 is pre-installed on Windows 11 and most Windows 10 systems with recent Edge updates.

### Rust compilation is slow on first run

This is normal. Tauri compiles the entire Rust toolchain plus all dependencies. Use `cargo check` during development instead of full builds.

### Port 1420 already in use

Kill the existing Vite process:
```bash
taskkill /F /IM node.exe   # Windows
# or
pkill -f "vite"            # WSL/Linux
```

---

## Project File Map

```
Hollow/
├── index.html               HTML entry (transparent bg)
├── package.json             Node deps
├── vite.config.ts           Vite bundler
├── tsconfig.json            TypeScript config
├── src/
│   ├── main.tsx             React entry
│   ├── App.tsx              Root component
│   ├── styles/index.css     Tailwind v4 + CSS vars
│   ├── lib/
│   │   ├── store.ts         Zustand (308 lines)
│   │   ├── data.ts          Persistence layer
│   │   ├── gamification.ts  XP/level/rank math
│   │   ├── stages.ts        6 fasting stages + 8 protocols
│   │   └── achievements.ts  20 achievement definitions
│   └── components/
│       ├── FastingWidget.tsx
│       ├── Onboarding.tsx
│       ├── StatsPanel.tsx
│       ├── AchievementsPanel.tsx
│       ├── SettingsPanel.tsx
│       ├── PillMode.tsx
│       ├── Timer.tsx
│       ├── CircularProgress.tsx
│       ├── StageIndicator.tsx
│       ├── XpBar.tsx
│       ├── StreakIndicator.tsx
│       ├── Toast.tsx
│       └── ContextMenu.tsx
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── build.rs
    ├── capabilities/default.json
    ├── icons/                 12 icon sizes + ICO + ICNS
    └── src/
        ├── main.rs
        └── lib.rs             Tray + menu setup
```

---

## Adding New Components

1. Create `src/components/NewComponent.tsx`
2. Import in `App.tsx` and add to the component tree
3. Add to panel routing if it's a full-screen panel
4. No registry or import list needed — all in App.tsx

---

## Tauri Configuration Notes

### Window Size
- Default: 320x420
- Min: 280x360
- Frameless (`decorations: false`) means the OS does not draw a title bar
- Custom drag handled by `appWindow.startDragging()` in React

### Tray Icon
- Uses `app.default_window_icon()` which reads from `icons/icon.ico`
- The same ICO file is used for both the tray and the taskbar

### Permissions
- All permissions are explicit via `capabilities/default.json`
- Tauri 2 uses a deny-by-default permission model
- Adding a new plugin requires adding its permissions to this file

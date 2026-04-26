# Rust Backend (Tauri 2)

## Overview

The Rust backend is intentionally minimal. All business logic lives in the frontend. The Rust side is responsible for:
1. Window creation and lifecycle
2. System tray setup and menu event handling
3. IPC event emission (pill-mode-toggle)
4. Plugin initialization (store, fs, opener)

## File Structure

```
src-tauri/
├── Cargo.toml          # Dependencies
├── build.rs            # tauri_build::build()
├── tauri.conf.json     # Window config, bundle settings, capabilities
├── capabilities/
│   └── default.json   # Permission allowlist (Tauri 2)
├── icons/             # App + tray icons
└── src/
    ├── main.rs        # Entry: fn main() → hollow_lib::run()
    └── lib.rs         # All Tauri setup code
```

---

## main.rs

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    hollow_lib::run();
}
```

- `windows_subsystem = "windows"` hides the console window on release builds
- All logic is delegated to `hollow_lib::run()` from `lib.rs`

---

## lib.rs — Full Source

```rust
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // --- Tray Menu Setup ---
            let show_item = MenuItem::with_id(app, "show", "Show/Hide", true, None::<&str>)?;
            let always_on_top_item = MenuItem::with_id(app, "toggle_aot", "Toggle Always on Top", true, None::<&str>)?;
            let pill_item = MenuItem::with_id(app, "pill_mode", "Pill Mode", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_item, &always_on_top_item, &pill_item, &quit_item])?;

            // --- Tray Icon Builder ---
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Hollow - Fasting Widget")
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    let window = app.get_webview_window("main").unwrap();
                    match event.id.as_ref() {
                        "show" => {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "toggle_aot" => {
                            let current = window.is_always_on_top().unwrap_or(false);
                            let _ = window.set_always_on_top(!current);
                        }
                        "pill_mode" => {
                            let _ = window.emit("pill-mode-toggle", ());
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## Setup Phase (`.setup()`)

The closure passed to `tauri::Builder::default().setup(...)` runs once at app startup.

### 1. Menu Items

Four `MenuItem`s are created with explicit string IDs:
| ID | Label | Behavior |
|----|-------|----------|
| `"show"` | Show/Hide | Toggle window visibility |
| `"toggle_aot"` | Toggle Always on Top | Invert the always-on-top state |
| `"pill_mode"` | Pill Mode | Emit `pill-mode-toggle` event to frontend |
| `"quit"` | Quit | Full process exit via `app.exit(0)` |

- `MenuItem::with_id(app, id, label, enabled, accel)` — requires `app` handle
- `None::<&str>` for accelerator (no keyboard shortcut)
- Menu items are registered with IDs that are matched in `on_menu_event`

### 2. Tray Icon

Built with `TrayIconBuilder`:
- `.menu(&menu)` — links the menu
- `.tooltip("Hollow - Fasting Widget")` — shown on hover
- `.icon(app.default_window_icon().unwrap().clone())` — uses the app's default icon from `tauri.conf.json`
- The window name in `tauri.conf.json` is `"main"`, which is how `get_webview_window("main")` finds it

### 3. Menu Event Handler (`.on_menu_event()`)

Receives `&App` and `&MenuEvent`. The event ID is pattern-matched:

#### "show"
```rust
if window.is_visible().unwrap_or(false) {
    window.hide()    // toggle off → hide
} else {
    window.show();   // toggle on → show
    window.set_focus();
}
```

#### "toggle_aot"
```rust
let current = window.is_always_on_top().unwrap_or(false);
window.set_always_on_top(!current);
```
Reads the current state, then inverts it.

#### "pill_mode"
```rust
window.emit("pill-mode-toggle", ());
```
Emits a namespaced Tauri event. The frontend listens for this via:
```typescript
listen("pill-mode-toggle", () => togglePillMode());
```

#### "quit"
```rust
app.exit(0);
```
Full process termination. Unlike closing the window (which hides it), this exits completely.

### 4. Tray Icon Click Handler (`.on_tray_icon_event()`)

Only handles left-click up:
```rust
TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. }
```
Behavior: show window + focus. Right-clicks are handled by the native OS menu.

---

## Window Behavior

The window is configured in `tauri.conf.json`:

```json
"windows": [{
  "title": "Hollow",
  "width": 320,
  "height": 420,
  "minWidth": 280,
  "minHeight": 360,
  "resizable": true,
  "decorations": false,
  "transparent": true,
  "alwaysOnTop": true,
  "skipTaskbar": false,
  "center": true
}]
```

| Setting | Value | Effect |
|---------|-------|--------|
| `decorations` | `false` | No OS title bar — custom drag/title bar in React |
| `transparent` | `true` | Window background is transparent; React controls all visuals |
| `alwaysOnTop` | `true` | Window floats above all other windows |
| `center` | `true` | Opens at screen center |
| `resizable` | `true` | User can resize, min constraints prevent going too small |
| `skipTaskbar` | `false` | Show in taskbar (vs. tray-only) |

**Note on Close vs Quit:** The "X" button in the custom title bar calls `window.hide()` (via `handleCloseWidget`). This minimizes to tray. "Quit" from the tray menu calls `app.exit(0)`, fully terminating.

---

## Plugin Initialization

```rust
.plugin(tauri_plugin_opener::init())      // shell open for URLs
.plugin(tauri_plugin_store::Builder::new().build())  // JSON persistence
.plugin(tauri_plugin_fs::init())         // file system access (for future use)
```

The plugins are initialized in this order at startup. The `plugin-store` is built with default options, including the `autoSave: 300` behavior configured on the frontend side when calling `load()`.

---

## IPC Events

The frontend communicates with Rust via:
1. **Tauri Events** (Rust → Frontend): `window.emit(name, payload)` — used for `pill-mode-toggle`
2. **Tauri Commands** — not used in Hollow (all logic is JS-side)

---

## Error Handling

```rust
.expect("error while running tauri application")
```
This unwraps the `Result` from `tauri::Builder::run()`. Panics on failure with a descriptive message. In debug builds this prints to stderr; in release builds (without a console) this silently fails — but the `windows_subsystem = "windows"` attribute means release builds have no console to begin with.

---

## Cargo Build Outputs

| Output | Path |
|--------|------|
| Debug library | `target/debug/libhollow_lib.rlib` |
| Release library | `target/release/libhollow_lib.rlib` |
| Debug binary | `target/debug/hollow.exe` |
| Release binary | `target/release/hollow.exe` |
| NSIS installer | `target/release/bundle/nsis/*.exe` |

---

## Rust Compilation Settings

```toml
[lib]
name = "hollow_lib"
crate-type = ["staticlib", "cdylib", "rlib"]
```

| Type | Purpose |
|------|---------|
| `staticlib` | Static linking for the final binary |
| `cdylib` | C-compatible dynamic library (used by Tauri) |
| `rlib` | Rust library format (used by `#[cfg(test)]`) |

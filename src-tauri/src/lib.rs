use tauri::Manager;

#[cfg(desktop)]
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter,
};

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![quit_app]);

    // Desktop-only setup: system tray + menu. Mobile (iOS/Android) has no tray paradigm.
    #[cfg(desktop)]
    let builder = builder.setup(|app| {
        let show_item = MenuItem::with_id(app, "show", "Show/Hide", true, None::<&str>)?;
        let always_on_top_item =
            MenuItem::with_id(app, "toggle_aot", "Toggle Always on Top", true, None::<&str>)?;
        let pill_item = MenuItem::with_id(app, "pill_mode", "Pill Mode", true, None::<&str>)?;
        let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

        let menu = Menu::with_items(
            app,
            &[&show_item, &always_on_top_item, &pill_item, &quit_item],
        )?;

        let _tray = TrayIconBuilder::new()
            .menu(&menu)
            .tooltip("Hollow - Fasting Widget")
            .icon(app.default_window_icon().unwrap().clone())
            .on_menu_event(|app, event| {
                let window = match app.get_webview_window("main") {
                    Some(w) => w,
                    None => return,
                };
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
                } = event
                {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            })
            .build(app)?;

        Ok(())
    });

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use knowledge_base_pro::services::db_service;
use knowledge_base_pro::commands::ai;
use std::sync::Mutex;

use tauri::{GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent};

fn main() {
    let conn = db_service::init_db().expect("Failed to initialize database");
    
    // Define the system tray
    let tray = SystemTray::new();

    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            _ => {}
        })
        .manage(db_service::DbState(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            ai::synthesize_query,
            knowledge_base_pro::commands::cards::create_card,
            knowledge_base_pro::commands::cards::search_cards
        ])
        .setup(|app| {
            // Register Global Hotkey: Cmd+Shift+Space (or Ctrl+Shift+Space)
            // Note: In development, this might conflict if not handled carefully, but for production it's standard.
            let app_handle = app.handle();
            let mut shortcut = app.global_shortcut_manager();
            
            shortcut
                .register("CmdOrCtrl+Shift+Space", move || {
                    let window = app_handle.get_window("capture");
                    if let Some(win) = window {
                        if win.is_visible().unwrap() {
                            win.hide().unwrap();
                        } else {
                            win.show().unwrap();
                            win.set_focus().unwrap();
                        }
                    }
                })
                .expect("Failed to register global shortcut");
                
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

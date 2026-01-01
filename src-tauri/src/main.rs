use knowledge_base_pro::services::db_service;
use knowledge_base_pro::services::local_llm::LocalLLMState;
use knowledge_base_pro::commands::ai;
use std::sync::Mutex;

use tauri::{GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent};

fn main() {
    let conn = db_service::init_db().expect("Failed to initialize database");
    
    // Initialize Local LLM State (Lazy loading)
    let llm_state = LocalLLMState::new();
    
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
        .manage(llm_state) // Manage the LLM State
        .invoke_handler(tauri::generate_handler![
            ai::synthesize_query,
            ai::get_model_status,
            ai::delete_model,
            knowledge_base_pro::commands::cards::create_card,
            knowledge_base_pro::commands::cards::search_cards,
            knowledge_base_pro::commands::data::import_files,
            knowledge_base_pro::commands::data::export_notes,
            knowledge_base_pro::commands::data::create_backup,
            knowledge_base_pro::commands::data::search_notes,
            knowledge_base_pro::commands::organization::create_folder,
            knowledge_base_pro::commands::organization::get_folders,
            knowledge_base_pro::commands::organization::update_note_folder,
            knowledge_base_pro::commands::organization::create_tag,
            knowledge_base_pro::commands::organization::link_tag_to_note,
            knowledge_base_pro::commands::organization::get_note_tags,
            knowledge_base_pro::commands::organization::unlink_tag_from_note
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
                
            // Initialize Background Worker (The Subconscious)
            knowledge_base_pro::services::background::init(app.handle());

            // Initialize Web Bridge (API Server)
            knowledge_base_pro::services::server::init();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

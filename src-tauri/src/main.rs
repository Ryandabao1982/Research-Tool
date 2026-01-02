use knowledge_base_pro::services::db_service;
use knowledge_base_pro::services::local_llm::LocalLLMState;
use knowledge_base_pro::services::passphrase_service::PassphraseState;
use knowledge_base_pro::commands::ai;
use knowledge_base_pro::commands::data_settings;
use knowledge_base_pro::commands::quick_commands;
use knowledge_base_pro::commands::dashboard_commands;
use std::sync::Mutex;

use tauri::{GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent};

fn main() {
    let conn = db_service::init_db().expect("Failed to initialize database");
    
    // Initialize Local LLM State (Lazy loading)
    let llm_state = LocalLLMState::new();
    
    // Initialize Passphrase State for encryption
    let passphrase_state = PassphraseState::new();
    
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
        .manage(passphrase_state) // Manage encryption state
         .invoke_handler(tauri::generate_handler![
            ai::synthesize_query,
            ai::get_model_status,
            ai::delete_model,
            knowledge_base_pro::commands::cards::create_card,
            knowledge_base_pro::commands::cards::search_cards,
            knowledge_base_pro::commands::data::get_notes,
            knowledge_base_pro::commands::data::get_note,
            knowledge_base_pro::commands::data::create_note,
            knowledge_base_pro::commands::data::update_note,
            knowledge_base_pro::commands::data::delete_note,
            knowledge_base_pro::commands::organization::get_folders,
            knowledge_base_pro::commands::data::import_files,
            knowledge_base_pro::commands::data::export_notes,
            knowledge_base_pro::commands::data::create_backup,
            knowledge_base_pro::commands::data::search_notes,
            knowledge_base_pro::commands::organization::create_folder,
             knowledge_base_pro::commands::organization::get_folders,
             knowledge_base_pro::commands::organization::get_tags,
             knowledge_base_pro::commands::organization::update_note_folder,
             knowledge_base_pro::commands::organization::create_tag,
            knowledge_base_pro::commands::organization::link_tag_to_note,
            knowledge_base_pro::commands::organization::get_note_tags,
            knowledge_base_pro::commands::organization::unlink_tag_from_note,
            knowledge_base_pro::commands::related_notes::get_related_notes,
            knowledge_base_pro::commands::data_settings::get_metadata,
            knowledge_base_pro::commands::data_settings::set_metadata,
            // Quick capture commands
            quick_commands::quick_create_note,
            quick_commands::get_recent_notes,
            // Encryption commands
            knowledge_base_pro::commands::encryption_commands::set_passphrase,
            knowledge_base_pro::commands::encryption_commands::verify_passphrase,
            knowledge_base_pro::commands::encryption_commands::is_encryption_enabled,
            knowledge_base_pro::commands::encryption_commands::clear_passphrase,
            knowledge_base_pro::commands::encryption_commands::encrypt_string,
            knowledge_base_pro::commands::encryption_commands::decrypt_string,
            // Encryption settings commands
            knowledge_base_pro::commands::encryption_settings::get_encryption_settings,
            knowledge_base_pro::commands::encryption_settings::set_encryption_settings,
            knowledge_base_pro::commands::encryption_settings::migrate_to_encrypted,
            knowledge_base_pro::commands::encryption_settings::migrate_to_plaintext,
            knowledge_base_pro::commands::encryption_settings::can_migrate,
            // Dashboard commands
            dashboard_commands::save_dashboard_layout,
            dashboard_commands::load_dashboard_layout,
            dashboard_commands::reset_dashboard_layout,
            dashboard_commands::get_all_dashboard_layouts,
            // Search commands
            knowledge_base_pro::commands::search_commands::search_with_role,
           ])




        .setup(|app| {
            // Register Global Hotkey: Alt+Space for Rapid Capture
            // This works even when app is in background (AC: #7)
            let app_handle = app.handle();
            let mut shortcut = app.global_shortcut_manager();
            
            // Alt+Space for rapid capture modal
            shortcut
                .register("Alt+Space", move || {
                    // Get or create the capture window
                    let window = app_handle.get_window("capture");
                    if let Some(win) = window {
                        // Window exists, just show and focus
                        if !win.is_visible().unwrap() {
                            win.show().unwrap();
                        }
                        win.set_focus().unwrap();
                    } else {
                        // Window doesn't exist yet, create it
                        // This will be handled by the frontend when it registers the shortcut
                        log::info!("Alt+Space pressed - frontend will handle modal opening");
                    }
                    
                    // Also emit an event that frontend can listen to
                    let _ = app_handle.emit_all("global-shortcut-pressed", "Alt+Space");
                })
                .expect("Failed to register Alt+Space global shortcut");
                
            // Keep existing Cmd/Ctrl+Shift+Space for backward compatibility
            let app_handle_2 = app.handle();
            shortcut
                .register("CmdOrCtrl+Shift+Space", move || {
                    let window = app_handle_2.get_window("capture");
                    if let Some(win) = window {
                        if win.is_visible().unwrap() {
                            win.hide().unwrap();
                        } else {
                            win.show().unwrap();
                            win.set_focus().unwrap();
                        }
                    }
                })
                .expect("Failed to register legacy shortcut");
                
            // Initialize Background Worker (The Subconscious)
            knowledge_base_pro::services::background::init(app.handle());

            // Initialize Web Bridge (API Server)
            knowledge_base_pro::services::server::init();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

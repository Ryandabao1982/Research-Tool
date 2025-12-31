use knowledge_base_pro::services::db_service;
use knowledge_base_pro::commands::ai;
use std::sync::Mutex;

fn main() {
    let conn = db_service::init_db().expect("Failed to initialize database");
    
    tauri::Builder::default()
        .manage(db_service::DbState(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            ai::synthesize_notes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use crate::services::db_service::DbState;
use crate::services::cards;
use tauri::State;

#[tauri::command]
pub fn create_card(
    state: State<DbState>,
    type_id: String,
    content: String,
    metadata: String,
    role_context: String,
) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    cards::create_card(&conn, &type_id, &content, &metadata, &role_context)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_cards(
    state: State<DbState>,
    query: String,
) -> Result<Vec<cards::Card>, String> {
    let conn = state.0.lock().unwrap();
    cards::search_cards(&conn, &query)
        .map_err(|e| e.to_string())
}

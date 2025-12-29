#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod models;
mod database;
mod services;
mod commands;

use std::sync::Arc;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::Pool;
use tauri::State;

use database::create_connection_pool;
use services::*;
use commands::*;

pub struct AppState {
    pub db: Pool<sqlx::Sqlite>,
    pub note_service: NoteService,
    pub folder_service: FolderService,
    pub tag_service: TagService,
    pub search_service: SearchService,
    pub link_service: LinkService,
    pub ai_service: AIService,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let database_url = "sqlite:knowledge_base.db?mode=rwc";
    let db = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    database::run_migrations(&db).await?;

    let tag_service = TagService::new(db.clone());
    let note_service = NoteService::new(db.clone(), tag_service.clone());
    let folder_service = FolderService::new(db.clone());
    let search_service = SearchService::new(db.clone());
    let link_service = LinkService::new(db.clone(), note_service.clone());
    let ai_service = AIService::new(db.clone());
    
    // Initialize AI providers
    ai_service.initialize_providers().await?;

    let state = Arc::new(AppState {
        db: db.clone(),
        note_service,
        folder_service,
        tag_service,
        search_service,
        link_service,
        ai_service,
    });

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            // Note commands
            list_notes,
            get_note,
            create_note,
            update_note,
            delete_note,
            get_notes_by_folder,
            get_notes_by_tag,
            // Folder commands
            list_folders,
            create_folder,
            update_folder,
            delete_folder,
            // Tag commands
            list_tags,
            create_tag,
            delete_tag,
            update_note_tags,
            add_tag_to_note,
            remove_tag_from_note,
            // Search commands
            search_notes,
            search_in_folder,
            search_by_tag,
            get_search_suggestions,
            get_all_notes_count,
            get_recent_notes,
            // Link commands
            list_links,
            create_link,
            delete_link,
            get_backlinks,
            get_forward_links,
            parse_and_create_links,
            get_link_count,
            // AI commands
            generate_ai_response,
            generate_ai_response_stream,
            create_ai_conversation,
            add_ai_message,
            get_ai_conversation_history,
            list_ai_conversations,
            get_available_ai_models,
            search_related_documents,
            generate_document_summary,
            generate_study_guide,
            initialize_ai_providers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}

use axum::{
    routing::{post, get},
    Json, Router, http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use rusqlite::Connection;
use crate::services::cards;

#[derive(Deserialize)]
struct ClipRequest {
    url: String,
    title: String,
    content: String,
}

#[derive(Serialize)]
struct ClipResponse {
    status: String,
    id: i64,
}

pub fn init() {
    tauri::async_runtime::spawn(async {
        let app = Router::new()
            .route("/health", get(|| async { "OK" }))
            .route("/clip", post(handle_clip));

        let addr = SocketAddr::from(([127, 0, 0, 1], 41234));
        println!("[Web Bridge] Listening on {}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, app).await.unwrap();
    });
}

async fn handle_clip(Json(payload): Json<ClipRequest>) -> (StatusCode, Json<ClipResponse>) {
    println!("[Web Bridge] Received clip: {}", payload.title);

    // Open a fresh connection for this request (simpler than sharing state for MVP)
    // In WAL mode, this is safe for concurrent reads/writes
    let conn = match Connection::open("knowledge_base.db") {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to open DB: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(ClipResponse { status: "error".to_string(), id: 0 }));
        }
    };

    // Create the card
    let metadata = format!("{{\"url\": \"{}\", \"source\": \"web_clip\"}}", payload.url);
    
    // We use a dummy ID here because we can't easily retrieve the inserted ID with our current create_card signature 
    // unless we modify it. But create_card returns Result<i64, ...> so we are good.
    
    let result = cards::create_card(&conn, "clip", &payload.content, &metadata, "all");

    match result {
        Ok(id) => (StatusCode::OK, Json(ClipResponse { status: "success".to_string(), id })),
        Err(e) => {
            eprintln!("Failed to save clip: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ClipResponse { status: "error".to_string(), id: 0 }))
        }
    }
}

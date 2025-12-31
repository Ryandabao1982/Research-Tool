use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use crate::services::db_service::DbState;

pub fn init(app: AppHandle) {
    thread::spawn(move || {
        loop {
            // Sleep for 30 seconds (simulating "subconscious" processing cycle)
            thread::sleep(Duration::from_secs(30));
            
            println!("[Subconscious] Waking up to analyze...");

            // Access DB State safely
            let state = app.state::<DbState>();
            if let Ok(conn) = state.0.lock() {
                use crate::services::graph_analysis;
                
                if let Some(insight) = graph_analysis::find_connections(&conn) {
                    println!("[Subconscious] Insight found: {}", insight.description);
                    app.emit_all("insight-found", insight.description).unwrap(); // Emitting simple string for now
                }
            }
        }
    });
}

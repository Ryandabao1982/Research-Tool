use rusqlite::{Connection, Result};
use std::path::Path;

pub fn create_backup(conn: &Connection, backup_path: &Path) -> Result<()> {
    // SQLite's VACUUM INTO is a safe way to backup a live database
    // It creates a consistent copy without blocking other connections
    let query = format!("VACUUM INTO '{}'", backup_path.to_string_lossy());
    conn.execute(&query, [])?;
    Ok(())
}

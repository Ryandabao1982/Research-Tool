use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Card {
    pub id: i64,
    pub type_id: String,
    pub content: String,
    pub metadata: String, // stored as JSON
    pub role_context: String,
    pub created_at: String,
}

pub fn create_tables(conn: &Connection) -> Result<()> {
    // 1. Create the main polymorphic cards table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY,
            type_id TEXT NOT NULL,
            content TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            role_context TEXT DEFAULT 'general',
            created_at TEXT DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // 2. Create the FTS5 virtual table for lightning-fast search
    // Note: FTS5 requires the 'fts5' feature in rusqlite, usually enabled by 'bundled'
    conn.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
            content, 
            type_id UNINDEXED, 
            metadata UNINDEXED
        )",
        [],
    )?;

    // 3. Create triggers to keep FTS index in sync
    conn.execute(
        "CREATE TRIGGER IF NOT EXISTS cards_ai AFTER INSERT ON cards BEGIN
            INSERT INTO cards_fts(rowid, content, type_id, metadata)
            VALUES (new.id, new.content, new.type_id, new.metadata);
        END",
        [],
    )?;

    conn.execute(
        "CREATE TRIGGER IF NOT EXISTS cards_ad AFTER DELETE ON cards BEGIN
            INSERT INTO cards_fts(cards_fts, rowid, content, type_id, metadata)
            VALUES('delete', old.id, old.content, old.type_id, old.metadata);
        END",
        [],
    )?;

    conn.execute(
        "CREATE TRIGGER IF NOT EXISTS cards_au AFTER UPDATE ON cards BEGIN
            INSERT INTO cards_fts(cards_fts, rowid, content, type_id, metadata)
            VALUES('delete', old.id, old.content, old.type_id, old.metadata);
            INSERT INTO cards_fts(rowid, content, type_id, metadata)
            VALUES (new.id, new.content, new.type_id, new.metadata);
        END",
        [],
    )?;

    Ok(())
}

pub fn create_card(conn: &Connection, type_id: &str, content: &str, metadata: &str, role_context: &str) -> Result<i64> {
    conn.execute(
        "INSERT INTO cards (type_id, content, metadata, role_context) VALUES (?1, ?2, ?3, ?4)",
        params![type_id, content, metadata, role_context],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn search_cards(conn: &Connection, query: &str) -> Result<Vec<Card>> {
    // Basic FTS5 search
    let mut stmt = conn.prepare(
        "SELECT id, type_id, content, metadata, role_context, created_at 
         FROM cards 
         WHERE id IN (SELECT rowid FROM cards_fts WHERE cards_fts MATCH ?1)
         ORDER BY rank
         LIMIT 20"
    )?;

    let card_iter = stmt.query_map(params![query], |row| {
        Ok(Card {
            id: row.get(0)?,
            type_id: row.get(1)?,
            content: row.get(2)?,
            metadata: row.get(3)?,
            role_context: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;

    let mut cards = Vec::new();
    for card in card_iter {
        cards.push(card?);
    }
    
    Ok(cards)
}

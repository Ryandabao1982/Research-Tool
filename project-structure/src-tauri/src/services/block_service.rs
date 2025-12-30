use rusqlite::{params, Connection, Result};
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Block, CreateBlockRequest, UpdateBlockRequest};

pub struct BlockService {
    conn: Connection,
}

impl BlockService {
    pub fn new(conn: Connection) -> Self {
        Self { conn }
    }

    /**
     * Get max position for blocks in a note
     */
    async fn get_max_position(&self, note_id: &str) -> Result<i32> {
        let mut stmt = self.conn.prepare(
            "SELECT COALESCE(MAX(position), 0) FROM blocks WHERE note_id = ?1"
        )?;

        let position: i32 = stmt.query_row(params![note_id])?.unwrap_or(0)?;
        Ok(position)
    }

    /**
     * List all blocks for a note
     */
    pub async fn list_blocks(&self, note_id: &str) -> Result<Vec<Block>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, note_id, content, block_type, position, parent_block_id, created_at, updated_at 
             FROM blocks WHERE note_id = ?1 ORDER BY position ASC"
        )?;

        let blocks = stmt
            .query_map(params![note_id], |row| {
                Ok(Block {
                    id: row.get(0)?,
                    note_id: row.get(1)?,
                    content: row.get(2)?,
                    block_type: row.get(3)?,
                    position: row.get(4)?,
                    parent_block_id: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<Block>>>()?;

        Ok(blocks)
    }

    /**
     * Get a single block by ID
     */
    pub async fn get_block(&self, id: &str) -> Result<Option<Block>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, note_id, content, block_type, position, parent_block_id, created_at, updated_at 
             FROM blocks WHERE id = ?1"
        )?;

        let block = stmt.query_row(params![id]).optional()?.map(|row| Block {
            id: row.get(0)?,
            note_id: row.get(1)?,
            content: row.get(2)?,
            block_type: row.get(3)?,
            position: row.get(4)?,
            parent_block_id: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        });

        Ok(block)
    }

    /**
     * Create a new block
     */
    pub async fn create_block(&self, request: CreateBlockRequest) -> Result<Block> {
        let block_id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let position = self.get_max_position(&request.note_id).await? + 1;

        let block_type = request.block_type.unwrap_or_else(|| "paragraph".to_string());

        self.conn.execute(
            "INSERT INTO blocks (id, note_id, content, block_type, position, parent_block_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
            params![
                &block_id,
                &request.note_id,
                &request.content,
                &block_type,
                position,
                &request.parent_block_id,
                &now,
                &now,
            ],
        )?;

        Ok(Block {
            id: block_id,
            note_id: request.note_id,
            content: request.content,
            block_type,
            position,
            parent_block_id: request.parent_block_id,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    /**
     * Update an existing block
     */
    pub async fn update_block(&self, id: &str, request: UpdateBlockRequest) -> Result<Block> {
        let now = Utc::now().to_rfc3339();
        let old_block = self.get_block(id).await?.ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;

        let block = old_block.ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;

        let content = request.content.unwrap_or_else(|| block.content);
        let block_type = request.block_type.unwrap_or_else(|| block.block_type);
        let parent_block_id = request.parent_block_id;
        let position = request.position.unwrap_or_else(|| block.position);

        self.conn.execute(
            "UPDATE blocks SET content = ?1, block_type = ?2, parent_block_id = ?3, updated_at = ?4
             WHERE id = ?5",
            params![&content, &block_type, &parent_block_id, &now, id],
        )?;

        Ok(Block {
            id: id.to_string(),
            note_id: block.note_id,
            content,
            block_type,
            position,
            parent_block_id,
            created_at: block.created_at,
            updated_at: now,
        })
    }

    /**
     * Delete a block
     */
    pub async fn delete_block(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM blocks WHERE id = ?1", params![id])?;
        Ok(())
    }

    /**
     * Create a link between two blocks
     * This creates a link record with block-level references
     */
    pub async fn create_block_link(
        &self,
        source_block_id: &str,
        target_block_id: &str,
        note_id: &str
    ) -> Result<String> {
        let link_id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        // Create a link record using the blocks table as reference
        self.conn.execute(
            "INSERT INTO links (id, source_note_id, target_note_id, source_block_id, target_block_id, link_type, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                &link_id,
                note_id,
                note_id,
                source_block_id,
                target_block_id,
                "block_reference",
                &now,
            ],
        )?;

        Ok(link_id)
    }

    /**
     * Search blocks using FTS5
     */
    pub async fn search_blocks(&self, query: &str, note_id: Option<&str>) -> Result<Vec<Block>> {
        let query_with_wildcards = format!("%{}%", query);

        let sql = if let Some(nid) = note_id {
            "SELECT b.id, b.note_id, b.content, b.block_type, b.position, b.parent_block_id, b.created_at, b.updated_at 
             FROM blocks b
             JOIN blocks_fts fts ON b.id = fts.block_id
             WHERE fts.content MATCH ?1 AND b.note_id = ?2
             ORDER BY b.position ASC"
        } else {
            "SELECT b.id, b.note_id, b.content, b.block_type, b.position, b.parent_block_id, b.created_at, b.updated_at 
             FROM blocks b
             JOIN blocks_fts fts ON b.id = fts.block_id
             WHERE fts.content MATCH ?1
             ORDER BY b.position ASC"
        };

        let mut stmt = self.conn.prepare(&sql)?;

        let blocks = if let Some(nid) = note_id {
            stmt.query_map(params![query_with_wildcards, nid], |row| {
                Ok(Block {
                    id: row.get(0)?,
                    note_id: row.get(1)?,
                    content: row.get(2)?,
                    block_type: row.get(3)?,
                    position: row.get(4)?,
                    parent_block_id: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<Block>>>()?
        } else {
            stmt.query_map(params![query_with_wildcards], |row| {
                Ok(Block {
                    id: row.get(0)?,
                    note_id: row.get(1)?,
                    content: row.get(2)?,
                    block_type: row.get(3)?,
                    position: row.get(4)?,
                    parent_block_id: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<Block>>>()?
        };

        Ok(blocks?)
    }
}

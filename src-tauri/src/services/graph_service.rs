//! Graph Service for Force-Directed Graph Visualization
//! 
//! Provides data structures and queries for D3.js force-directed graph
//! Uses existing SQLite `notes` and `note_links` tables

use serde::{Deserialize, Serialize};
use sqlx::{Sqlite, Pool};
use std::collections::HashSet;
use regex::Regex;

/// Graph node structure for D3.js visualization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub label: String,
    pub group: Option<String>,
    pub connections: usize,  // Number of connections for LOD filtering
}

/// Graph link structure for D3.js visualization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphLink {
    pub source: String,
    pub target: String,
}

/// Complete graph data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphData {
    pub nodes: Vec<GraphNode>,
    pub links: Vec<GraphLink>,
}

/// Graph Service - Handles graph data queries and transformations
pub struct GraphService {
    db_pool: Pool<Sqlite>,
}

/// Validate UUID format
fn is_valid_uuid(id: &str) -> bool {
    let uuid_regex = Regex::new(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$").unwrap();
    uuid_regex.is_match(&id.to_lowercase())
}

impl GraphService {
    /// Create new graph service instance
    pub fn new(db_pool: Pool<Sqlite>) -> Self {
        Self { db_pool }
    }

    /// Get graph data with performance optimization
    /// 
    /// # Arguments
    /// * `limit` - Maximum number of nodes to return (default: 500)
    /// 
    /// # Returns
    /// GraphData with nodes and links in D3.js format
    /// 
    /// # Performance
    /// - Uses connection count for initial node selection
    /// - Orders by connection count (most connected nodes first)
    /// - Supports lazy loading for large datasets
    pub async fn get_graph_data(&self, limit: usize) -> Result<GraphData, String> {
        // Validate limit parameter
        if limit == 0 || limit > 10000 {
            return Err("Limit must be between 1 and 10000".to_string());
        }

        // Query top N nodes by connection count
        let nodes_query = r#"
            SELECT 
                n.id,
                n.title,
                n.folder_id,
                COUNT(DISTINCT CASE 
                    WHEN nt1.source_id = n.id THEN nt1.target_id 
                    WHEN nt2.target_id = n.id THEN nt2.source_id 
                END) as connections
            FROM notes n
            LEFT JOIN note_links nt1 ON n.id = nt1.source_id
            LEFT JOIN note_links nt2 ON n.id = nt2.target_id
            GROUP BY n.id
            ORDER BY connections DESC, n.updated_at DESC
            LIMIT ?
        "#;

        let nodes = sqlx::query_as::<_, (String, String, Option<String>, i64)>(nodes_query)
            .bind(limit as i64)
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to fetch nodes: {}", e))?
            .into_iter()
            .map(|(id, title, folder_id, connections)| {
                // Validate node ID is valid UUID format
                if !is_valid_uuid(&id) {
                    return Err(format!("Invalid node ID format: {}", id));
                }
                Ok(GraphNode {
                    id,
                    label: title,
                    group: folder_id,
                    connections: connections as usize,
                })
            })
            .collect::<Result<Vec<_>, String>>()?;

        // Extract node IDs for link query
        let node_ids: Vec<String> = nodes.iter().map(|n| n.id.clone()).collect();

        if node_ids.is_empty() {
            return Ok(GraphData {
                nodes: Vec::new(),
                links: Vec::new(),
            });
        }

        // Query links between selected nodes using parameterized IN clause
        // Build the IN clause with placeholders
        let placeholders = vec!["?"; node_ids.len()].join(", ");
        let links_query = format!(
            "SELECT source_id, target_id FROM note_links 
             WHERE source_id IN ({}) AND target_id IN ({})",
            placeholders, placeholders
        );

        // Create query with all node IDs
        let mut query = sqlx::query_as::<_, (String, String)>(&links_query);
        for id in &node_ids {
            query = query.bind(id);
        }
        for id in &node_ids {
            query = query.bind(id);
        }

        let links = query
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to fetch links: {}", e))?
            .into_iter()
            .map(|(source, target)| {
                // Validate both IDs
                if !is_valid_uuid(&source) || !is_valid_uuid(&target) {
                    return Err(format!("Invalid link IDs: {} -> {}", source, target));
                }
                Ok(GraphLink { source, target })
            })
            .collect::<Result<Vec<_>, String>>()?;

        Ok(GraphData { nodes, links })
    }

    /// Get neighbors of a specific node for lazy loading
    /// 
    /// # Arguments
    /// * `node_id` - ID of the node to get neighbors for
    /// * `limit` - Maximum number of neighbors to return
    /// 
    /// # Returns
    /// Vec<GraphNode> containing neighbor nodes
    pub async fn get_node_neighbors(&self, node_id: &str, limit: usize) -> Result<Vec<GraphNode>, String> {
        // Validate node_id
        if !is_valid_uuid(node_id) {
            return Err(format!("Invalid node ID format: {}", node_id));
        }

        if limit == 0 || limit > 1000 {
            return Err("Limit must be between 1 and 1000".to_string());
        }

        // Get direct neighbors (both directions)
        let neighbors_query = r#"
            SELECT DISTINCT n.id, n.title, n.folder_id
            FROM notes n
            INNER JOIN note_links nl ON (
                (nl.source_id = n.id AND nl.target_id = ?)
                OR (nl.target_id = n.id AND nl.source_id = ?)
            )
            WHERE n.id != ?
            LIMIT ?
        "#;

        let neighbors = sqlx::query_as::<_, (String, String, Option<String>)>(neighbors_query)
            .bind(node_id)
            .bind(node_id)
            .bind(node_id)
            .bind(limit as i64)
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to fetch neighbors: {}", e))?
            .into_iter()
            .map(|(id, title, folder_id)| {
                if !is_valid_uuid(&id) {
                    return Err(format!("Invalid neighbor ID: {}", id));
                }
                Ok(GraphNode {
                    id,
                    label: title,
                    group: folder_id,
                    connections: 0,  // Will be calculated on client if needed
                })
            })
            .collect::<Result<Vec<_>, String>>()?;

        Ok(neighbors)
    }

    /// Get graph data with lazy loading support
    /// 
    /// # Arguments
    /// * `limit` - Initial node limit
    /// * `loaded_ids` - IDs already loaded (to avoid duplicates)
    /// 
    /// # Returns
    /// GraphData with only new nodes and their connections
    pub async fn get_graph_data_incremental(
        &self, 
        limit: usize, 
        loaded_ids: &[String]
    ) -> Result<GraphData, String> {
        // Validate limit
        if limit == 0 || limit > 10000 {
            return Err("Limit must be between 1 and 10000".to_string());
        }

        // Validate loaded IDs
        for id in loaded_ids {
            if !is_valid_uuid(id) {
                return Err(format!("Invalid loaded ID: {}", id));
            }
        }

        // Build parameterized query for NOT IN
        if loaded_ids.is_empty() {
            // No loaded IDs, use regular query
            return self.get_graph_data(limit).await;
        }

        let placeholders = vec!["?"; loaded_ids.len()].join(", ");
        let nodes_query = format!(
            r#"SELECT 
                n.id,
                n.title,
                n.folder_id,
                COUNT(DISTINCT CASE 
                    WHEN nt1.source_id = n.id THEN nt1.target_id 
                    WHEN nt2.target_id = n.id THEN nt2.source_id 
                END) as connections
            FROM notes n
            LEFT JOIN note_links nt1 ON n.id = nt1.source_id
            LEFT JOIN note_links nt2 ON n.id = nt2.target_id
            WHERE n.id NOT IN ({})
            GROUP BY n.id
            ORDER BY connections DESC, n.updated_at DESC
            LIMIT ?"#,
            placeholders
        );

        let mut query = sqlx::query_as::<_, (String, String, Option<String>, i64)>(&nodes_query);
        for id in loaded_ids {
            query = query.bind(id);
        }
        query = query.bind(limit as i64);

        let nodes = query
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to fetch incremental nodes: {}", e))?
            .into_iter()
            .map(|(id, title, folder_id, connections)| {
                if !is_valid_uuid(&id) {
                    return Err(format!("Invalid node ID: {}", id));
                }
                Ok(GraphNode {
                    id,
                    label: title,
                    group: folder_id,
                    connections: connections as usize,
                })
            })
            .collect::<Result<Vec<_>, String>>()?;

        if nodes.is_empty() {
            return Ok(GraphData {
                nodes: Vec::new(),
                links: Vec::new(),
            });
        }

        // Get all node IDs including newly loaded
        let all_node_ids: Vec<String> = nodes.iter().map(|n| n.id.clone()).chain(loaded_ids.iter().cloned()).collect();

        // Query links involving these nodes using parameterized IN
        let placeholders = vec!["?"; all_node_ids.len()].join(", ");
        let links_query = format!(
            "SELECT source_id, target_id FROM note_links 
             WHERE source_id IN ({}) AND target_id IN ({})",
            placeholders, placeholders
        );

        let mut query = sqlx::query_as::<_, (String, String)>(&links_query);
        for id in &all_node_ids {
            query = query.bind(id);
        }
        for id in &all_node_ids {
            query = query.bind(id);
        }

        let links = query
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to fetch incremental links: {}", e))?
            .into_iter()
            .map(|(source, target)| {
                if !is_valid_uuid(&source) || !is_valid_uuid(&target) {
                    return Err(format!("Invalid link IDs: {} -> {}", source, target));
                }
                Ok(GraphLink { source, target })
            })
            .collect::<Result<Vec<_>, String>>()?;

        Ok(GraphData { nodes, links })
    }

    /// Get performance metrics for graph data
    /// 
    /// # Returns
    /// Tuple of (total_nodes, total_links, max_connections)
    pub async fn get_performance_metrics(&self) -> Result<(usize, usize, usize), String> {
        let total_nodes_query = "SELECT COUNT(*) FROM notes";
        let total_links_query = "SELECT COUNT(*) FROM note_links";
        let max_connections_query = r#"
            SELECT MAX(connections) FROM (
                SELECT COUNT(*) as connections
                FROM note_links
                GROUP BY source_id
            )
        "#;

        let total_nodes: i64 = sqlx::query_scalar(total_nodes_query)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to get node count: {}", e))?;

        let total_links: i64 = sqlx::query_scalar(total_links_query)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to get link count: {}", e))?;

        let max_connections: i64 = sqlx::query_scalar(max_connections_query)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| format!("Failed to get max connections: {}", e))?
            .unwrap_or(0);

        Ok((
            total_nodes as usize,
            total_links as usize,
            max_connections as usize,
        ))
    }
}

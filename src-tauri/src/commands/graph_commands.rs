//! Graph Commands for Tauri IPC
//! 
//! Exposes graph data services to frontend via Tauri commands

use crate::services::graph_service::{GraphService, GraphData, GraphNode};
use tauri::State;
use crate::db_service::DbState;

/// Get graph data for force-directed visualization
/// 
/// # Arguments
/// * `limit` - Maximum number of nodes to return (default: 500)
/// 
/// # Returns
/// GraphData with nodes and links in D3.js format
/// 
/// # AC References
/// - AC #1: D3.js visualization of nodes and links
/// - AC #5: Uses same SQLite data source as rest of app
#[tauri::command]
pub async fn get_graph(
    limit: Option<usize>,
    db_state: State<'_, DbState>,
) -> Result<GraphData, String> {
    let limit = limit.unwrap_or(500);
    
    let graph_service = GraphService::new(db_state.pool.clone());
    graph_service.get_graph_data(limit).await
}

/// Get neighbors of a specific node for lazy loading
/// 
/// # Arguments
/// * `node_id` - ID of the node to get neighbors for
/// * `limit` - Maximum number of neighbors to return
/// 
/// # Returns
/// Vec<GraphNode> containing neighbor nodes
/// 
/// # AC References
/// - AC #4: Lazy loading for large graphs
#[tauri::command]
pub async fn get_node_neighbors(
    node_id: String,
    limit: Option<usize>,
    db_state: State<'_, DbState>,
) -> Result<Vec<GraphNode>, String> {
    let limit = limit.unwrap_or(50);
    
    let graph_service = GraphService::new(db_state.pool.clone());
    graph_service.get_node_neighbors(&node_id, limit).await
}

/// Get graph data incrementally (for lazy loading)
/// 
/// # Arguments
/// * `limit` - Number of new nodes to load
/// * `loaded_ids` - IDs already loaded by client
/// 
/// # Returns
/// GraphData with only new nodes and their connections
/// 
/// # AC References
/// - AC #4: Lazy loading for large graphs (>1000 nodes)
#[tauri::command]
pub async fn get_graph_incremental(
    limit: usize,
    loaded_ids: Vec<String>,
    db_state: State<'_, DbState>,
) -> Result<GraphData, String> {
    let graph_service = GraphService::new(db_state.pool.clone());
    graph_service.get_graph_data_incremental(limit, &loaded_ids).await
}

/// Get performance metrics for graph data
/// 
/// # Returns
/// Tuple of (total_nodes, total_links, max_connections)
/// 
/// # AC References
/// - AC #4: Performance validation (>1000 nodes, 60fps)
#[tauri::command]
pub async fn get_graph_metrics(
    db_state: State<'_, DbState>,
) -> Result<(usize, usize, usize), String> {
    let graph_service = GraphService::new(db_state.pool.clone());
    graph_service.get_performance_metrics().await
}

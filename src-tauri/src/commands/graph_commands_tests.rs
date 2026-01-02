//! Unit tests for Graph Commands

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::graph_service::{GraphData, GraphNode, GraphLink};
    use tauri::State;
    use sqlx::{Sqlite, Pool};

    // Mock DbState for testing
    async fn setup_mock_db() -> Pool<Sqlite> {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        
        sqlx::query(
            r#"
            CREATE TABLE notes (id TEXT PRIMARY KEY, title TEXT, folder_id TEXT);
            CREATE TABLE note_links (source_id TEXT, target_id TEXT);
            
            INSERT INTO notes VALUES ('n1', 'Note 1', 'f1'), ('n2', 'Note 2', 'f2');
            INSERT INTO note_links VALUES ('n1', 'n2');
            "#
        )
        .execute(&pool)
        .await
        .unwrap();
        
        pool
    }

    #[tokio::test]
    async fn test_get_graph_command() {
        let pool = setup_mock_db().await;
        let db_state = crate::db_service::DbState(std::sync::Mutex::new(pool));
        
        let result = get_graph(Some(10), State::new(&db_state)).await.unwrap();
        
        assert!(result.nodes.len() > 0);
        assert!(result.links.len() > 0);
    }

    #[tokio::test]
    async fn test_get_graph_command_default_limit() {
        let pool = setup_mock_db().await;
        let db_state = crate::db_service::DbState(std::sync::Mutex::new(pool));
        
        let result = get_graph(None, State::new(&db_state)).await.unwrap();
        
        // Should use default of 500
        assert!(result.nodes.len() <= 500);
    }

    #[tokio::test]
    async fn test_get_node_neighbors_command() {
        let pool = setup_mock_db().await;
        let db_state = crate::db_service::DbState(std::sync::Mutex::new(pool));
        
        let result = get_node_neighbors("n1".to_string(), Some(10), State::new(&db_state)).await.unwrap();
        
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].id, "n2");
    }

    #[tokio::test]
    async fn test_get_graph_incremental_command() {
        let pool = setup_mock_db().await;
        let db_state = crate::db_service::DbState(std::sync::Mutex::new(pool));
        
        let result = get_graph_incremental(10, vec!["n1".to_string()], State::new(&db_state)).await.unwrap();
        
        // Should get n2 and its links
        assert!(result.nodes.iter().any(|n| n.id == "n2"));
    }

    #[tokio::test]
    async fn test_get_graph_metrics_command() {
        let pool = setup_mock_db().await;
        let db_state = crate::db_service::DbState(std::sync::Mutex::new(pool));
        
        let result = get_graph_metrics(State::new(&db_state)).await.unwrap();
        
        assert_eq!(result.0, 2); // 2 nodes
        assert_eq!(result.1, 1); // 1 link
        assert!(result.2 >= 1); // max connections
    }

    #[tokio::test]
    async fn test_command_error_handling() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let db_state = crate::db_service::DbState(std::sync::Mutex::new(pool));
        
        // Empty database
        let result = get_graph(Some(10), State::new(&db_state)).await.unwrap();
        assert_eq!(result.nodes.len(), 0);
    }
}

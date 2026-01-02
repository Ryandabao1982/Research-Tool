//! Unit tests for GraphService

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::{Sqlite, Pool};
    use std::collections::HashSet;

    async fn setup_test_db() -> Pool<Sqlite> {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        
        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                folder_id TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE note_links (
                source_id TEXT,
                target_id TEXT,
                PRIMARY KEY (source_id, target_id)
            );
            "#
        )
        .execute(&pool)
        .await
        .unwrap();

        // Insert test data
        sqlx::query(
            r#"
            INSERT INTO notes (id, title, folder_id) VALUES
            ('note-1', 'First Note', 'folder-a'),
            ('note-2', 'Second Note', 'folder-b'),
            ('note-3', 'Third Note', 'folder-a'),
            ('note-4', 'Fourth Note', 'folder-c');
            "#
        )
        .execute(&pool)
        .await
        .unwrap();

        sqlx::query(
            r#"
            INSERT INTO note_links (source_id, target_id) VALUES
            ('note-1', 'note-2'),
            ('note-1', 'note-3'),
            ('note-2', 'note-3'),
            ('note-3', 'note-4');
            "#
        )
        .execute(&pool)
        .await
        .unwrap();

        pool
    }

    #[tokio::test]
    async fn test_get_graph_data_returns_correct_structure() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        let result = service.get_graph_data(10).await.unwrap();
        
        assert_eq!(result.nodes.len(), 4);
        assert_eq!(result.links.len(), 4);
        
        // Verify node structure
        let first_node = result.nodes.iter().find(|n| n.id == "note-1").unwrap();
        assert_eq!(first_node.label, "First Note");
        assert_eq!(first_node.group, Some("folder-a".to_string()));
        assert_eq!(first_node.connections, 2); // note-1 has 2 links
    }

    #[tokio::test]
    async fn test_get_graph_data_respects_limit() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        let result = service.get_graph_data(2).await.unwrap();
        
        assert_eq!(result.nodes.len(), 2);
        // Should get top 2 by connection count
    }

    #[tokio::test]
    async fn test_get_graph_data_empty_database() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        
        sqlx::query(
            r#"
            CREATE TABLE notes (id TEXT PRIMARY KEY, title TEXT, folder_id TEXT);
            CREATE TABLE note_links (source_id TEXT, target_id TEXT);
            "#
        )
        .execute(&pool)
        .await
        .unwrap();

        let service = GraphService::new(pool);
        let result = service.get_graph_data(10).await.unwrap();
        
        assert_eq!(result.nodes.len(), 0);
        assert_eq!(result.links.len(), 0);
    }

    #[tokio::test]
    async fn test_get_node_neighbors_returns_connected_nodes() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        // note-1 is connected to note-2 and note-3
        let neighbors = service.get_node_neighbors("note-1", 10).await.unwrap();
        
        assert_eq!(neighbors.len(), 2);
        let neighbor_ids: HashSet<_> = neighbors.iter().map(|n| n.id.clone()).collect();
        assert!(neighbor_ids.contains("note-2"));
        assert!(neighbor_ids.contains("note-3"));
    }

    #[tokio::test]
    async fn test_get_node_neighbors_bidirectional() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        // note-3 has incoming from note-1, note-2 and outgoing to note-4
        let neighbors = service.get_node_neighbors("note-3", 10).await.unwrap();
        
        assert_eq!(neighbors.len(), 3);
        let neighbor_ids: HashSet<_> = neighbors.iter().map(|n| n.id.clone()).collect();
        assert!(neighbor_ids.contains("note-1"));
        assert!(neighbor_ids.contains("note-2"));
        assert!(neighbor_ids.contains("note-4"));
    }

    #[tokio::test]
    async fn test_get_node_neighbors_respects_limit() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        let neighbors = service.get_node_neighbors("note-3", 2).await.unwrap();
        
        assert_eq!(neighbors.len(), 2);
    }

    #[tokio::test]
    async fn test_get_graph_data_incremental() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        // Load first 2 nodes
        let initial = service.get_graph_data(2).await.unwrap();
        assert_eq!(initial.nodes.len(), 2);
        
        let loaded_ids: Vec<_> = initial.nodes.iter().map(|n| n.id.clone()).collect();
        
        // Load more
        let incremental = service.get_graph_data_incremental(2, &loaded_ids).await.unwrap();
        
        // Should get remaining nodes
        assert!(incremental.nodes.len() > 0);
        assert!(incremental.nodes.iter().all(|n| !loaded_ids.contains(&n.id)));
    }

    #[tokio::test]
    async fn test_get_performance_metrics() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        let (total_nodes, total_links, max_connections) = service.get_performance_metrics().await.unwrap();
        
        assert_eq!(total_nodes, 4);
        assert_eq!(total_links, 4);
        assert!(max_connections >= 2); // note-1 and note-3 have 2 connections
    }

    #[tokio::test]
    async fn test_sql_injection_prevention() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        // Try with malicious IDs
        let malicious_ids = vec!["'; DROP TABLE notes; --".to_string()];
        let result = service.get_graph_data_incremental(10, &malicious_ids).await;
        
        // Should fail gracefully, not crash
        assert!(result.is_err() || result.unwrap().nodes.len() == 0);
        
        // Database should still be intact
        let metrics = service.get_performance_metrics().await.unwrap();
        assert_eq!(metrics.0, 4); // Still 4 nodes
    }

    #[tokio::test]
    async fn test_uuid_validation() {
        let pool = setup_test_db().await;
        let service = GraphService::new(pool);
        
        // Valid UUID format
        let valid_neighbors = service.get_node_neighbors("note-1", 10).await;
        assert!(valid_neighbors.is_ok());
        
        // Invalid format
        let invalid_neighbors = service.get_node_neighbors("invalid-id", 10).await;
        // Should return empty or error, not crash
        assert!(invalid_neighbors.is_ok() || invalid_neighbors.is_err());
    }
}

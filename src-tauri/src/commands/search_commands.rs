use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub r#type: String,
    pub title: String,
    pub description: Option<String>,
    pub role: String,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[tauri::command]
pub async fn search_with_role(
    query: String,
    role: String,
) -> Result<Vec<SearchResult>, String> {
    // Mock implementation for development
    // In production, this would query the database
    
    let mock_data = match role.as_str() {
        "manager" => vec![
            SearchResult {
                id: "1".to_string(),
                r#type: "note".to_string(),
                title: "Q4 Budget Review".to_string(),
                description: Some("Financial planning for Q4 2024".to_string()),
                role: "manager".to_string(),
                metadata: HashMap::new(),
            },
            SearchResult {
                id: "2".to_string(),
                r#type: "task".to_string(),
                title: "Team Standup".to_string(),
                description: Some("Daily sync with engineering team".to_string()),
                role: "manager".to_string(),
                metadata: HashMap::new(),
            },
            SearchResult {
                id: "3".to_string(),
                r#type: "project".to_string(),
                title: "Product Launch".to_string(),
                description: Some("New feature rollout plan".to_string()),
                role: "manager".to_string(),
                metadata: HashMap::new(),
            },
        ],
        "learner" => vec![
            SearchResult {
                id: "4".to_string(),
                r#type: "note".to_string(),
                title: "React Fundamentals".to_string(),
                description: Some("Core concepts of React".to_string()),
                role: "learner".to_string(),
                metadata: HashMap::new(),
            },
            SearchResult {
                id: "5".to_string(),
                r#type: "learning".to_string(),
                title: "TypeScript Course".to_string(),
                description: Some("Advanced TypeScript patterns".to_string()),
                role: "learner".to_string(),
                metadata: HashMap::new(),
            },
            SearchResult {
                id: "6".to_string(),
                r#type: "note".to_string(),
                title: "Study Notes".to_string(),
                description: Some("Week 3 material".to_string()),
                role: "learner".to_string(),
                metadata: HashMap::new(),
            },
        ],
        "coach" => vec![
            SearchResult {
                id: "7".to_string(),
                r#type: "note".to_string(),
                title: "Team Retrospective".to_string(),
                description: Some("Sprint 12 review".to_string()),
                role: "coach".to_string(),
                metadata: HashMap::new(),
            },
            SearchResult {
                id: "8".to_string(),
                r#type: "team".to_string(),
                title: "Engineering Team".to_string(),
                description: Some("Backend developers".to_string()),
                role: "coach".to_string(),
                metadata: HashMap::new(),
            },
            SearchResult {
                id: "9".to_string(),
                r#type: "template".to_string(),
                title: "1:1 Meeting".to_string(),
                description: Some("Coaching framework".to_string()),
                role: "coach".to_string(),
                metadata: HashMap::new(),
            },
        ],
        _ => return Err("Invalid role".to_string()),
    };

    // Filter by query
    let query_lower = query.to_lowercase();
    let filtered: Vec<SearchResult> = mock_data
        .into_iter()
        .filter(|item| {
            item.title.to_lowercase().contains(&query_lower)
                || item
                    .description
                    .as_ref()
                    .map(|d| d.to_lowercase().contains(&query_lower))
                    .unwrap_or(false)
        })
        .collect();

    Ok(filtered)
}

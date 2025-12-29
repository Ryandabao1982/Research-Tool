use sqlx::{Pool, Sqlite};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub query: String,
    pub context_documents: Vec<String>,
    pub include_citations: bool,
    pub model_preference: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub answer: String,
    pub citations: Vec<AICitation>,
    pub confidence_score: f64,
    pub model_used: String,
    pub processing_time: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AICitation {
    pub document_id: String,
    pub document_title: String,
    pub relevant_excerpt: String,
    pub confidence_score: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIConversation {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub message_count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIMessage {
    pub id: String,
    pub conversation_id: String,
    pub role: String,
    pub content: String,
    pub citations: Option<String>,
    pub created_at: String,
}

pub struct AIService {
    db: Pool<Sqlite>,
}

impl AIService {
    pub fn new(db: Pool<Sqlite>) -> Self {
        Self { db }
    }

    pub async fn generate_response(&self, request: AIRequest) -> Result<AIResponse, String> {
        let start_time = std::time::Instant::now();

        let model = self.select_model(&request);
        let answer = self.mock_ai_response(&request.query).await;

        let processing_time = start_time.elapsed().as_millis() as u64;

        let citations = if request.include_citations {
            self.generate_mock_citations(&request.context_documents)
        } else {
            Vec::new()
        };

        Ok(AIResponse {
            answer,
            citations,
            confidence_score: 0.85,
            model_used: model,
            processing_time,
        })
    }

    pub async fn create_conversation(&self, title: String) -> Result<AIConversation, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        sqlx::query("INSERT INTO ai_conversations (id, title, created_at, message_count) VALUES (?, ?, ?, ?)")
            .bind(&id)
            .bind(&title)
            .bind(&now)
            .bind(0)
            .execute(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(AIConversation {
            id,
            title,
            created_at: now,
            message_count: 0,
        })
    }

    pub async fn add_message(&self, conversation_id: String, role: String, content: String, citations: Option<String>) -> Result<AIMessage, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            "INSERT INTO ai_messages (id, conversation_id, role, content, citations, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&conversation_id)
        .bind(&role)
        .bind(&content)
        .bind(&citations)
        .bind(&now)
        .execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        Ok(AIMessage {
            id,
            conversation_id,
            role,
            content,
            citations,
            created_at: now,
        })
    }

    pub async fn get_conversation_history(&self, conversation_id: String) -> Result<Vec<AIMessage>, String> {
        let rows = sqlx::query(
            "SELECT id, conversation_id, role, content, citations, created_at 
             FROM ai_messages 
             WHERE conversation_id = ? 
             ORDER BY created_at ASC"
        )
        .bind(&conversation_id)
        .fetch_all(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        let messages = rows.iter().map(|row| AIMessage {
            id: row.get("id"),
            conversation_id: row.get("conversation_id"),
            role: row.get("role"),
            content: row.get("content"),
            citations: row.get("citations"),
            created_at: row.get("created_at"),
        }).collect();

        Ok(messages)
    }

    pub async fn list_conversations(&self) -> Result<Vec<AIConversation>, String> {
        let rows = sqlx::query(
            "SELECT id, title, created_at, message_count 
             FROM ai_conversations 
             ORDER BY created_at DESC"
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        let conversations = rows.iter().map(|row| AIConversation {
            id: row.get("id"),
            title: row.get("title"),
            created_at: row.get("created_at"),
            message_count: row.get("message_count"),
        }).collect();

        Ok(conversations)
    }

    fn select_model(&self, request: &AIRequest) -> String {
        if let Some(preference) = &request.model_preference {
            preference.clone()
        } else {
            let query_lower = request.query.to_lowercase();
            if query_lower.contains("code") || query_lower.contains("function") {
                "codellama:7b".to_string()
            } else if query_lower.len() < 50 {
                "gemma2:2b".to_string()
            } else {
                "phi3.1:mini".to_string()
            }
        }
    }

    async fn mock_ai_response(&self, query: &str) -> String {
        format!(
            "This is a mock AI response to your query: '{}'. 
             In production, this would use Ollama to generate real responses.",
            query
        )
    }

    fn generate_mock_citations(&self, document_ids: &[String]) -> Vec<AICitation> {
        document_ids
            .iter()
            .enumerate()
            .map(|(i, doc_id)| AICitation {
                document_id: doc_id.clone(),
                document_title: format!("Document {}", i + 1),
                relevant_excerpt: "Relevant excerpt from the document...".to_string(),
                confidence_score: 0.85 - (i as f64 * 0.05),
            })
            .collect()
    }
}

use sqlx::{Pool, Sqlite};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use std::collections::HashMap;
use std::time::Instant;
use async_trait::async_trait;
use reqwest::Client;
use dashmap::DashMap;
use lru::LruCache;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIRequest {
    pub query: String,
    pub context_documents: Vec<String>,
    pub include_citations: bool,
    pub model_preference: Option<String>,
    pub conversation_id: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIResponse {
    pub answer: String,
    pub citations: Vec<AICitation>,
    pub confidence_score: f64,
    pub model_used: String,
    pub processing_time: u64,
    pub token_usage: TokenUsage,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AICitation {
    pub document_id: String,
    pub document_title: String,
    pub relevant_excerpt: String,
    pub confidence_score: f64,
    pub page_number: Option<u32>,
    pub relevance_type: CitationType,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CitationType {
    DirectQuote,
    Paraphrase,
    Concept,
    Background,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIConversation {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub message_count: i32,
    pub last_activity: String,
    pub model_preference: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIMessage {
    pub id: String,
    pub conversation_id: String,
    pub role: String,
    pub content: String,
    pub citations: Option<String>,
    pub created_at: String,
    pub token_usage: Option<TokenUsage>,
    pub model_used: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIModel {
    pub id: String,
    pub name: String,
    pub description: String,
    pub context_length: usize,
    pub model_type: ModelType,
    pub capabilities: Vec<ModelCapability>,
    pub size_mb: u32,
    pub requires_gpu: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ModelType {
    TextGeneration,
    CodeGeneration,
    Embedding,
    Multimodal,
    AudioTranscription,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ModelCapability {
    ChatCompletion,
    TextCompletion,
    FunctionCalling,
    Streaming,
    Embedding,
    Reranking,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIProviderConfig {
    pub provider_type: ProviderType,
    pub api_endpoint: Option<String>,
    pub api_key: Option<String>,
    pub model_id: String,
    pub enabled: bool,
    pub priority: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ProviderType {
    Ollama,
    OpenAI,
    Anthropic,
    HuggingFace,
    LocalLLM,
}

#[async_trait]
pub trait LLMProvider: Send + Sync {
    async fn generate(&self, request: &AIRequest) -> Result<AIResponse, Box<dyn std::error::Error + Send + Sync>>;
    async fn generate_stream(&self, request: &AIRequest) -> Result<tokio::sync::mpsc::UnboundedReceiver<String>, Box<dyn std::error::Error + Send + Sync>>;
    fn get_model(&self) -> &AIModel;
    fn is_available(&self) -> bool;
}

pub struct OllamaProvider {
    client: Client,
    model: AIModel,
    endpoint: String,
}

impl OllamaProvider {
    pub fn new(model: AIModel, endpoint: String) -> Self {
        Self {
            client: Client::new(),
            model,
            endpoint,
        }
    }
}

#[async_trait]
impl LLMProvider for OllamaProvider {
    async fn generate(&self, request: &AIRequest) -> Result<AIResponse, Box<dyn std::error::Error + Send + Sync>> {
        let start_time = Instant::now();
        
        let context = if request.context_documents.is_empty() {
            String::new()
        } else {
            format!("\n\nContext documents:\n{}", 
                request.context_documents.iter()
                    .enumerate()
                    .map(|(i, doc)| format!("Document {}: {}", i + 1, doc))
                    .collect::<Vec<_>>()
                    .join("\n")
            )
        };

        let prompt = format!(
            "You are a helpful AI assistant for a knowledge base application. \
             Provide accurate, helpful responses based on the given context.{}\
             \n\nUser Query: {}\n\nResponse:",
            context,
            request.query
        );

        let ollama_request = serde_json::json!({
            "model": self.model.id,
            "prompt": prompt,
            "stream": false,
            "options": {
                "temperature": request.temperature.unwrap_or(0.7),
                "num_predict": request.max_tokens.unwrap_or(2048)
            }
        });

        let response = self.client
            .post(&format!("{}/api/generate", self.endpoint))
            .json(&ollama_request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Ollama API error: {}", response.status()).into());
        }

        let ollama_response: serde_json::Value = response.json().await?;
        let answer = ollama_response["response"].as_str().unwrap_or("").to_string();

        let processing_time = start_time.elapsed().as_millis() as u64;
        
        // Estimate token usage (rough approximation)
        let prompt_tokens = (prompt.len() / 4) as u32;
        let completion_tokens = (answer.len() / 4) as u32;
        let token_usage = TokenUsage {
            prompt_tokens,
            completion_tokens,
            total_tokens: prompt_tokens + completion_tokens,
        };

        let citations = if request.include_citations {
            self.generate_citations(&request.context_documents, &answer)
        } else {
            Vec::new()
        };

        Ok(AIResponse {
            answer,
            citations,
            confidence_score: 0.85,
            model_used: self.model.id.clone(),
            processing_time,
            token_usage,
        })
    }

    async fn generate_stream(&self, request: &AIRequest) -> Result<tokio::sync::mpsc::UnboundedReceiver<String>, Box<dyn std::error::Error + Send + Sync>> {
        let (tx, rx) = tokio::sync::mpsc::unbounded_channel();
        
        let context = if request.context_documents.is_empty() {
            String::new()
        } else {
            format!("\n\nContext documents:\n{}", 
                request.context_documents.iter()
                    .enumerate()
                    .map(|(i, doc)| format!("Document {}: {}", i + 1, doc))
                    .collect::<Vec<_>>()
                    .join("\n")
            )
        };

        let prompt = format!(
            "You are a helpful AI assistant for a knowledge base application. \
             Provide accurate, helpful responses based on the given context.{}\
             \n\nUser Query: {}\n\nResponse:",
            context,
            request.query
        );

        let ollama_request = serde_json::json!({
            "model": self.model.id,
            "prompt": prompt,
            "stream": true,
            "options": {
                "temperature": request.temperature.unwrap_or(0.7),
                "num_predict": request.max_tokens.unwrap_or(2048)
            }
        });

        let client = self.client.clone();
        let endpoint = self.endpoint.clone();

        tokio::spawn(async move {
            match client
                .post(&format!("{}/api/generate", endpoint))
                .json(&ollama_request)
                .send()
                .await
            {
                Ok(response) if response.status().is_success() => {
                    if let Ok(bytes_stream) = response.bytes_stream() {
                        use futures_util::StreamExt;
                        let mut stream = bytes_stream.map(|result| {
                            match result {
                                Ok(chunk) => chunk.to_vec(),
                                Err(e) => {
                                    eprintln!("Stream error: {}", e);
                                    vec![]
                                }
                            }
                        });

                        while let Some(chunk) = stream.next().await {
                            let chunk_str = String::from_utf8_lossy(&chunk);
                            for line in chunk_str.lines() {
                                if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                                    if let Some(response_text) = json["response"].as_str() {
                                        let _ = tx.send(response_text.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
                Ok(_) | Err(_) => {
                    let _ = tx.send("Error generating response".to_string());
                }
            }
        });

        Ok(rx)
    }

    fn get_model(&self) -> &AIModel {
        &self.model
    }

    fn is_available(&self) -> bool {
        // Simple health check - in a real implementation, you'd ping the endpoint
        true
    }
}

impl OllamaProvider {
    fn generate_citations(&self, documents: &[String], _answer: &str) -> Vec<AICitation> {
        documents
            .iter()
            .enumerate()
            .map(|(i, doc)| AICitation {
                document_id: format!("doc_{}", i),
                document_title: format!("Document {}", i + 1),
                relevant_excerpt: if doc.len() > 200 { 
                    format!("{}...", &doc[..200]) 
                } else { 
                    doc.clone() 
                },
                confidence_score: 0.85 - (i as f64 * 0.05),
                page_number: None,
                relevance_type: CitationType::Background,
            })
            .collect()
    }
}

pub struct AIService {
    db: Pool<Sqlite>,
    providers: Arc<DashMap<String, Box<dyn LLMProvider>>>,
    model_cache: Arc<Mutex<LruCache<String, AIModel>>>,
    default_model: String,
}

impl AIService {
    pub fn new(db: Pool<Sqlite>) -> Self {
        let providers: Arc<DashMap<String, Box<dyn LLMProvider>>> = Arc::new(DashMap::new());
        
        Self { 
            db,
            providers,
            model_cache: Arc::new(Mutex::new(LruCache::new(std::num::NonZeroUsize::new(100).unwrap()))),
            default_model: "phi3.1:mini".to_string(),
        }
    }

    pub async fn initialize_providers(&self) -> Result<(), String> {
        // Initialize default Ollama provider
        let model = AIModel {
            id: "phi3.1:mini".to_string(),
            name: "Phi-3.1 Mini".to_string(),
            description: "Small but powerful language model for general use".to_string(),
            context_length: 128000,
            model_type: ModelType::TextGeneration,
            capabilities: vec![ModelCapability::ChatCompletion, ModelCapability::TextCompletion, ModelCapability::Streaming],
            size_mb: 2000,
            requires_gpu: false,
        };

        let provider = OllamaProvider::new(model.clone(), "http://localhost:11434".to_string());
        self.providers.insert("phi3.1:mini".to_string(), Box::new(provider));
        
        // Add CodeLlama for coding tasks
        let code_model = AIModel {
            id: "codellama:7b".to_string(),
            name: "CodeLlama 7B".to_string(),
            description: "Large language model optimized for code generation and understanding".to_string(),
            context_length: 16000,
            model_type: ModelType::CodeGeneration,
            capabilities: vec![ModelCapability::ChatCompletion, ModelCapability::TextCompletion, ModelCapability::Streaming],
            size_mb: 4000,
            requires_gpu: true,
        };

        let code_provider = OllamaProvider::new(code_model.clone(), "http://localhost:11434".to_string());
        self.providers.insert("codellama:7b".to_string(), Box::new(code_provider));

        Ok(())
    }

    pub async fn generate_response(&self, request: AIRequest) -> Result<AIResponse, String> {
        let model_id = request.model_preference.as_ref().unwrap_or(&self.default_model).clone();
        
        if let Some(provider) = self.providers.get(&model_id) {
            provider.generate(&request).await.map_err(|e| e.to_string())
        } else {
            Err(format!("Model {} not available", model_id))
        }
    }

    pub async fn generate_response_stream(&self, request: AIRequest) -> Result<tokio::sync::mpsc::UnboundedReceiver<String>, String> {
        let model_id = request.model_preference.as_ref().unwrap_or(&self.default_model).clone();
        
        if let Some(provider) = self.providers.get(&model_id) {
            provider.generate_stream(&request).await.map_err(|e| e.to_string())
        } else {
            Err(format!("Model {} not available", model_id))
        }
    }

    pub async fn create_conversation(&self, title: String) -> Result<AIConversation, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        sqlx::query("INSERT INTO ai_conversations (id, title, created_at, message_count, last_activity, model_preference) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(&id)
            .bind(&title)
            .bind(&now)
            .bind(0)
            .bind(&now)
            .bind(&self.default_model)
            .execute(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(AIConversation {
            id,
            title,
            created_at: now,
            message_count: 0,
            last_activity: now,
            model_preference: Some(self.default_model.clone()),
        })
    }

    pub async fn add_message(&self, conversation_id: String, role: String, content: String, citations: Option<String>, token_usage: Option<TokenUsage>, model_used: String) -> Result<AIMessage, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        let citations_json = if let Some(cits) = citations {
            Some(cits)
        } else {
            Some("[]".to_string())
        };

        let token_usage_json = if let Some(usage) = token_usage {
            Some(serde_json::to_string(&usage).unwrap_or_default())
        } else {
            None
        };

        sqlx::query(
            "INSERT INTO ai_messages (id, conversation_id, role, content, citations, created_at, token_usage, model_used) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&conversation_id)
        .bind(&role)
        .bind(&content)
        .bind(&citations_json)
        .bind(&now)
        .bind(&token_usage_json)
        .bind(&model_used)
        .execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        // Update conversation message count and last activity
        sqlx::query("UPDATE ai_conversations SET message_count = message_count + 1, last_activity = ? WHERE id = ?")
            .bind(&now)
            .bind(&conversation_id)
            .execute(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(AIMessage {
            id,
            conversation_id,
            role,
            content,
            citations: citations_json,
            created_at: now,
            token_usage,
            model_used,
        })
    }

    pub async fn get_conversation_history(&self, conversation_id: String) -> Result<Vec<AIMessage>, String> {
        let rows = sqlx::query(
            "SELECT id, conversation_id, role, content, citations, created_at, token_usage, model_used 
             FROM ai_messages 
             WHERE conversation_id = ? 
             ORDER BY created_at ASC"
        )
        .bind(&conversation_id)
        .fetch_all(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        let messages = rows.iter().map(|row| {
            let token_usage_str: Option<String> = row.get("token_usage");
            let token_usage = if let Some(json_str) = token_usage_str {
                serde_json::from_str(&json_str).ok()
            } else {
                None
            };

            AIMessage {
                id: row.get("id"),
                conversation_id: row.get("conversation_id"),
                role: row.get("role"),
                content: row.get("content"),
                citations: row.get("citations"),
                created_at: row.get("created_at"),
                token_usage,
                model_used: row.get("model_used"),
            }
        }).collect();

        Ok(messages)
    }

    pub async fn list_conversations(&self) -> Result<Vec<AIConversation>, String> {
        let rows = sqlx::query(
            "SELECT id, title, created_at, message_count, last_activity, model_preference 
             FROM ai_conversations 
             ORDER BY last_activity DESC"
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        let conversations = rows.iter().map(|row| AIConversation {
            id: row.get("id"),
            title: row.get("title"),
            created_at: row.get("created_at"),
            message_count: row.get("message_count"),
            last_activity: row.get("last_activity"),
            model_preference: row.get("model_preference"),
        }).collect();

        Ok(conversations)
    }

    pub async fn get_available_models(&self) -> Result<Vec<AIModel>, String> {
        let mut models = Vec::new();
        
        for provider_entry in self.providers.iter() {
            let provider = provider_entry.value();
            if provider.is_available() {
                models.push(provider.get_model().clone());
            }
        }

        Ok(models)
    }

    pub async fn search_related_documents(&self, query: &str, limit: Option<i32>) -> Result<Vec<String>, String> {
        let limit = limit.unwrap_or(5);
        
        let rows = sqlx::query(
            "SELECT title, content FROM notes 
             WHERE title LIKE ? OR content LIKE ? 
             ORDER BY updated_at DESC 
             LIMIT ?"
        )
        .bind(format!("%{}%", query))
        .bind(format!("%{}%", query))
        .bind(limit)
        .fetch_all(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        let documents = rows.iter().map(|row| {
            let title: String = row.get("title");
            let content: String = row.get("content");
            format!("Title: {}\nContent: {}", title, content)
        }).collect();

        Ok(documents)
    }

    // Advanced AI features
    pub async fn generate_summary(&self, document_ids: &[String]) -> Result<String, String> {
        let mut documents = Vec::new();
        
        for doc_id in document_ids {
            if let Ok(note) = self.get_note_document(doc_id).await {
                documents.push(format!("Title: {}\nContent: {}", note.title, note.content));
            }
        }

        if documents.is_empty() {
            return Err("No documents found for summarization".to_string());
        }

        let request = AIRequest {
            query: "Please provide a comprehensive summary of these documents, highlighting key themes and insights.".to_string(),
            context_documents: documents,
            include_citations: true,
            model_preference: Some("phi3.1:mini".to_string()),
            conversation_id: None,
            temperature: Some(0.3),
            max_tokens: Some(1000),
        };

        let response = self.generate_response(request).await?;
        Ok(response.answer)
    }

    pub async fn generate_study_guide(&self, topic: &str, document_ids: &[String]) -> Result<String, String> {
        let mut documents = Vec::new();
        
        for doc_id in document_ids {
            if let Ok(note) = self.get_note_document(doc_id).await {
                documents.push(format!("Title: {}\nContent: {}", note.title, note.content));
            }
        }

        let request = AIRequest {
            query: format!("Create a comprehensive study guide about '{}' based on these documents. Include key concepts, study questions, and important facts.", topic),
            context_documents: documents,
            include_citations: true,
            model_preference: Some("phi3.1:mini".to_string()),
            conversation_id: None,
            temperature: Some(0.4),
            max_tokens: Some(2000),
        };

        let response = self.generate_response(request).await?;
        Ok(response.answer)
    }

    async fn get_note_document(&self, id: &str) -> Result<NoteDocument, String> {
        let row = sqlx::query("SELECT id, title, content FROM notes WHERE id = ?")
            .bind(id)
            .fetch_one(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(NoteDocument {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct NoteDocument {
    id: String,
    title: String,
    content: String,
}

impl Default for CitationType {
    fn default() -> Self {
        CitationType::Background
    }
}
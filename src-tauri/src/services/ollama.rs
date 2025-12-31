use serde::{Deserialize, Serialize};
use reqwest::blocking::Client;
use std::error::Error;

#[derive(Serialize)]
struct GenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Deserialize)]
struct GenerateResponse {
    response: String,
}

pub fn generate_response(prompt: &str, context: &str) -> Result<String, Box<dyn Error>> {
    let client = Client::new();
    let model = "llama3:latest"; // specific model can be configurable later

    let full_prompt = format!(
        "You are KnowledgeBase Pro, a helpful AI assistant. Use the following context to answer the user's question. If the answer is not in the context, say so.\n\nContext:\n{}\n\nQuestion:\n{}",
        context, prompt
    );

    let request = GenerateRequest {
        model: model.to_string(),
        prompt: full_prompt,
        stream: false,
    };

    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&request)
        .send()?;

    if res.status().is_success() {
        let response_body: GenerateResponse = res.json()?;
        Ok(response_body.response)
    } else {
        Err(format!("Ollama API failed: {}", res.status()).into())
    }
}

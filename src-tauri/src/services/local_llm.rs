use anyhow::{Error as E, Result};
use candle_core::{Tensor, Device, DType};
use candle_transformers::generation::LogitsProcessor;
use candle_transformers::models::quantized_llama as model;
use model::ModelWeights;
use tokenizers::Tokenizer;

use std::path::Path;
use std::sync::Mutex;
use std::io::Write;
use futures_util::StreamExt;
use serde::Serialize;

// Qwen 2.5 0.5B Instruct - A high quality small model
const MODEL_URL: &str = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf";
const TOKENIZER_URL: &str = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/resolve/main/tokenizer.json";

const MODEL_FILENAME: &str = "qwen2.5-0.5b-instruct-q4_k_m.gguf";
const TOKENIZER_FILENAME: &str = "tokenizer.json";

#[derive(Serialize, Clone)]
pub struct ModelStatus {
    pub downloaded: bool,
    pub model_path: String,
    pub model_size: u64,
}

pub struct LocalLLMState {
    pub model: Mutex<Option<ModelWeights>>,
    pub tokenizer: Mutex<Option<Tokenizer>>,
}

impl LocalLLMState {
    pub fn new() -> Self {
        Self {
            model: Mutex::new(None),
            tokenizer: Mutex::new(None),
        }
    }

    pub fn get_status(&self) -> ModelStatus {
        let resource_dir = Path::new("resources");
        let model_path = resource_dir.join(MODEL_FILENAME);
        
        let downloaded = model_path.exists();
        let model_size = if downloaded {
            std::fs::metadata(&model_path).map(|m| m.len()).unwrap_or(0)
        } else {
            0
        };

        ModelStatus {
            downloaded,
            model_path: model_path.to_string_lossy().to_string(),
            model_size,
        }
    }

    pub fn delete_model(&self) -> Result<()> {
        let resource_dir = Path::new("resources");
        let model_path = resource_dir.join(MODEL_FILENAME);
        let tokenizer_path = resource_dir.join(TOKENIZER_FILENAME);

        if model_path.exists() {
            std::fs::remove_file(model_path)?;
        }
        if tokenizer_path.exists() {
            std::fs::remove_file(tokenizer_path)?;
        }
        
        // Clear loaded state
        let mut model_guard = self.model.lock().unwrap();
        let mut tokenizer_guard = self.tokenizer.lock().unwrap();
        *model_guard = None;
        *tokenizer_guard = None;

        Ok(())
    }

    /// Checks if model files exist, downloads them if not.
    pub async fn check_and_download(&self) -> Result<(String, String)> {
        let resource_dir = Path::new("resources");
        if !resource_dir.exists() {
            std::fs::create_dir_all(resource_dir)?;
        }

        let model_path = resource_dir.join(MODEL_FILENAME);
        let tokenizer_path = resource_dir.join(TOKENIZER_FILENAME);

        self.download_if_missing(&model_path, MODEL_URL).await?;
        self.download_if_missing(&tokenizer_path, TOKENIZER_URL).await?;

        Ok((
            model_path.to_string_lossy().to_string(),
            tokenizer_path.to_string_lossy().to_string()
        ))
    }

    async fn download_if_missing(&self, path: &Path, url: &str) -> Result<()> {
        if path.exists() {
            return Ok(());
        }

        println!("Downloading {} to {:?}", url, path);
        
        let response = reqwest::get(url).await?;
        if !response.status().is_success() {
            return Err(E::msg(format!("Failed to download file: {}", response.status())));
        }

        let mut file = std::fs::File::create(path)?;
        let mut stream = response.bytes_stream();

        while let Some(item) = stream.next().await {
            let chunk = item?;
            file.write_all(&chunk)?;
        }

        println!("Download complete: {:?}", path);
        Ok(())
    }

    pub fn load_model(&self, model_path: &str, tokenizer_path: &str) -> Result<()> {
        let mut model_guard = self.model.lock().unwrap();
        let mut tokenizer_guard = self.tokenizer.lock().unwrap();

        if model_guard.is_some() {
            return Ok(()); // Already loaded
        }

        println!("Loading model from: {}", model_path);
        
        let mut file = std::fs::File::open(model_path)?;
        let start = std::time::Instant::now();
        
        // Load the GGUF model
        let model = model::ModelWeights::from_gguf(
            &mut file,
            &mut file,
            &Device::Cpu, // Start with CPU for safety, upgrade to Metal/CUDA later
        )?;
        
        println!("Model loaded in {:.2}s", start.elapsed().as_secs_f64());

        let tokenizer = Tokenizer::from_file(tokenizer_path).map_err(E::msg)?;

        *model_guard = Some(model);
        *tokenizer_guard = Some(tokenizer);

        Ok(())
    }

    pub fn generate(&self, prompt: &str) -> Result<String> {
        let model_guard = self.model.lock().unwrap();
        let tokenizer_guard = self.tokenizer.lock().unwrap();

        let model = model_guard.as_ref().ok_or(E::msg("Model not loaded"))?;
        let tokenizer = tokenizer_guard.as_ref().ok_or(E::msg("Tokenizer not loaded"))?;

        // Simple generation loop
        let tokens = tokenizer.encode(prompt, true).map_err(E::msg)?;
        let prompt_tokens = tokens.get_ids().to_vec();
        let mut all_tokens = vec![];
        
        let mut logits_processor = LogitsProcessor::new(299792458, Some(0.7), Some(0.95), Some(1.1)); // Seed, Temp, Top-P, Repeat Penalty

        let mut next_token = *prompt_tokens.last().unwrap();
        
        // Pre-fill the model with prompt
        // NOTE: This is a simplified sequential pre-fill. 
        // Real implementation needs to handle KV-cache for efficiency.
        let mut input = Tensor::new(prompt_tokens.as_slice(), &Device::Cpu)?.unsqueeze(0)?;
        let logits = model.forward(&input, 0)?;
        let logits = logits.squeeze(0)?;
        next_token = logits_processor.sample(&logits)?;
        all_tokens.push(next_token);

        // Generate 200 tokens max for now
        for index in 0..200 {
            let input = Tensor::new(&[next_token], &Device::Cpu)?.unsqueeze(0)?;
            let logits = model.forward(&input, prompt_tokens.len() + index)?;
            let logits = logits.squeeze(0)?;
            next_token = logits_processor.sample(&logits)?;
            all_tokens.push(next_token);
            
            // Check for EOS token (simplified)
            if next_token == 151645 || next_token == 151643 { break; } // Qwen EOS tokens
        }

        let output = tokenizer.decode(&all_tokens, true).map_err(E::msg)?;
        Ok(output)
    }
}

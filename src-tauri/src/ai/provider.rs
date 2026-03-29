use crate::ai::client::create_http_client;
use crate::ai::providers::anthropic::AnthropicProvider;
use crate::ai::providers::google::GoogleGeminiProvider;
use crate::ai::providers::openai::OpenAICompatibleProvider;
use crate::ai::registry::{ApiProtocol, PlatformDefinition};
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone)]
pub struct CompletionOptions {
    pub model: String,
    pub max_tokens: u32,
    pub temperature: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponse {
    pub content: String,
    pub sql: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProviderConfig {
    pub platform_id: String,
    pub api_key: String,
    pub model: String,
    pub custom_base_url: String,
    pub custom_headers: Vec<(String, String)>,
}

pub enum AiProviderKind {
    OpenAI(OpenAICompatibleProvider),
    Anthropic(AnthropicProvider),
    Google(GoogleGeminiProvider),
}

impl AiProviderKind {
    pub async fn chat_completion(
        &self,
        messages: Vec<ChatMessage>,
        options: CompletionOptions,
    ) -> Result<String, String> {
        match self {
            AiProviderKind::OpenAI(p) => p.chat_completion(messages, options).await,
            AiProviderKind::Anthropic(p) => p.chat_completion(messages, options).await,
            AiProviderKind::Google(p) => p.chat_completion(messages, options).await,
        }
    }

    pub async fn test_connection(&self) -> Result<bool, String> {
        match self {
            AiProviderKind::OpenAI(p) => p.test_connection().await,
            AiProviderKind::Anthropic(p) => p.test_connection().await,
            AiProviderKind::Google(p) => p.test_connection().await,
        }
    }
}

pub fn create_provider(
    platform: &PlatformDefinition,
    api_key: &str,
    custom_base_url: Option<&str>,
) -> AiProviderKind {
    let base_url = custom_base_url.unwrap_or(&platform.base_url);
    let client = create_http_client();

    match platform.protocol {
        ApiProtocol::OpenAICompatible | ApiProtocol::Ollama => {
            AiProviderKind::OpenAI(OpenAICompatibleProvider::new(
                client,
                base_url,
                api_key,
                platform.default_headers.clone(),
            ))
        }
        ApiProtocol::Anthropic => {
            AiProviderKind::Anthropic(AnthropicProvider::new(client, base_url, api_key))
        }
        ApiProtocol::GoogleGemini => {
            AiProviderKind::Google(GoogleGeminiProvider::new(client, base_url, api_key))
        }
    }
}

pub fn extract_sql_from_response(response: &str) -> Option<String> {
    let re = Regex::new(r"(?s)```sql\s*\n(.*?)```").ok()?;
    if let Some(caps) = re.captures(response) {
        Some(caps[1].trim().to_string())
    } else {
        let trimmed = response.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    }
}

use crate::ai::provider::{ChatMessage, CompletionOptions};

pub struct AnthropicProvider {
    client: reqwest::Client,
    base_url: String,
    api_key: String,
}

impl AnthropicProvider {
    pub fn new(client: reqwest::Client, base_url: &str, api_key: &str) -> Self {
        Self {
            client,
            base_url: base_url.to_string(),
            api_key: api_key.to_string(),
        }
    }

    pub async fn chat_completion(
        &self,
        messages: Vec<ChatMessage>,
        options: CompletionOptions,
    ) -> Result<String, String> {
        let url = format!("{}/messages", self.base_url);

        let system_msg = messages
            .iter()
            .find(|m| m.role == "system")
            .map(|m| m.content.clone());

        let user_messages: Vec<serde_json::Value> = messages
            .iter()
            .filter(|m| m.role != "system")
            .map(|m| {
                serde_json::json!({
                    "role": m.role,
                    "content": m.content,
                })
            })
            .collect();

        let mut body = serde_json::json!({
            "model": options.model,
            "messages": user_messages,
            "max_tokens": options.max_tokens,
        });

        if let Some(sys) = system_msg {
            body["system"] = serde_json::Value::String(sys);
        }

        let resp = self
            .client
            .post(&url)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let status = resp.status();
        let data: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if !status.is_success() {
            let error_msg = data["error"]["message"]
                .as_str()
                .unwrap_or("Unknown API error");
            return Err(format!("API error ({}): {}", status, error_msg));
        }

        let content = data["content"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(content)
    }

    pub async fn test_connection(&self) -> Result<bool, String> {
        let messages = vec![ChatMessage {
            role: "user".into(),
            content: "Reply with ok".into(),
        }];
        let options = CompletionOptions {
            model: String::new(),
            max_tokens: 10,
            temperature: 0.0,
        };
        self.chat_completion(messages, options).await.map(|_| true)
    }
}

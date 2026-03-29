use crate::ai::provider::{ChatMessage, CompletionOptions};

pub struct OpenAICompatibleProvider {
    client: reqwest::Client,
    base_url: String,
    api_key: String,
    default_headers: Vec<(String, String)>,
}

impl OpenAICompatibleProvider {
    pub fn new(
        client: reqwest::Client,
        base_url: &str,
        api_key: &str,
        default_headers: Vec<(String, String)>,
    ) -> Self {
        Self {
            client,
            base_url: base_url.to_string(),
            api_key: api_key.to_string(),
            default_headers,
        }
    }

    pub async fn chat_completion(
        &self,
        messages: Vec<ChatMessage>,
        options: CompletionOptions,
    ) -> Result<String, String> {
        let url = format!("{}/chat/completions", self.base_url);
        let body = serde_json::json!({
            "model": options.model,
            "messages": messages,
            "max_tokens": options.max_tokens,
            "temperature": options.temperature,
            "stream": false,
        });

        let mut req = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json");

        for (key, value) in &self.default_headers {
            req = req.header(key, value);
        }

        let resp = req
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

        let content = data["choices"][0]["message"]["content"]
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

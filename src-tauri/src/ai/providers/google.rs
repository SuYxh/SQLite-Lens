use crate::ai::provider::{ChatMessage, CompletionOptions};

pub struct GoogleGeminiProvider {
    client: reqwest::Client,
    base_url: String,
    api_key: String,
}

impl GoogleGeminiProvider {
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
        let url = format!(
            "{}/models/{}:generateContent?key={}",
            self.base_url, options.model, self.api_key
        );

        let contents: Vec<serde_json::Value> = messages
            .iter()
            .filter(|m| m.role != "system")
            .map(|m| {
                let role = if m.role == "assistant" {
                    "model"
                } else {
                    &m.role
                };
                serde_json::json!({
                    "role": role,
                    "parts": [{"text": m.content}],
                })
            })
            .collect();

        let system_instruction = messages
            .iter()
            .find(|m| m.role == "system")
            .map(|m| serde_json::json!({"parts": [{"text": m.content}]}));

        let mut body = serde_json::json!({
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": options.max_tokens,
                "temperature": options.temperature,
            },
        });

        if let Some(sys) = system_instruction {
            body["systemInstruction"] = sys;
        }

        let resp = self
            .client
            .post(&url)
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

        let content = data["candidates"][0]["content"]["parts"][0]["text"]
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

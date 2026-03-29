use crate::ai::prompt::{PromptBuilder, SchemaContext};
use crate::ai::provider::{
    create_provider, extract_sql_from_response, AiProviderConfig, AiResponse, ChatMessage,
    CompletionOptions,
};
use crate::ai::registry::{get_builtin_platforms, PlatformDefinition};
use crate::state::AppState;
use tauri::State;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub fn get_builtin_platforms_cmd() -> Vec<PlatformDefinition> {
    get_builtin_platforms()
}

#[tauri::command]
pub async fn ai_test_connection(
    platform_id: String,
    api_key: String,
    model: String,
    custom_base_url: Option<String>,
) -> Result<bool, String> {
    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == platform_id)
        .ok_or_else(|| format!("Platform not found: {}", platform_id))?;

    let provider = create_provider(platform, &api_key, custom_base_url.as_deref());
    let _ = &model;
    provider.test_connection().await
}

#[tauri::command]
pub async fn ai_generate_sql(
    state: State<'_, AppState>,
    db_id: String,
    text: String,
) -> Result<AiResponse, String> {
    let (schema_context, config) = {
        let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
        let conn = manager.get(&db_id)?;
        let schema = SchemaContext::from_connection(conn).map_err(|e| e.to_string())?;
        let config = state.ai_config.lock().map_err(|e| e.to_string())?.clone();
        (schema, config)
    };

    let config = config.ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let system_prompt = PromptBuilder::text_to_sql_system(&schema_context);
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: text,
        },
    ];

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 2048,
        temperature: 0.1,
    };

    let response = provider.chat_completion(messages, options).await?;
    let sql = extract_sql_from_response(&response);

    Ok(AiResponse { content: response, sql })
}

#[tauri::command]
pub async fn ai_explain_sql(
    state: State<'_, AppState>,
    db_id: String,
    sql: String,
) -> Result<AiResponse, String> {
    let config = state
        .ai_config
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let _ = &db_id;
    let system_prompt = PromptBuilder::explain_sql_system().to_string();
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: sql,
        },
    ];

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 2048,
        temperature: 0.3,
    };

    let response = provider.chat_completion(messages, options).await?;

    Ok(AiResponse {
        content: response,
        sql: None,
    })
}

#[tauri::command]
pub async fn ai_fix_error(
    state: State<'_, AppState>,
    db_id: String,
    sql: String,
    error: String,
) -> Result<AiResponse, String> {
    let (schema_context, config) = {
        let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
        let conn = manager.get(&db_id)?;
        let schema = SchemaContext::from_connection(conn).map_err(|e| e.to_string())?;
        let config = state.ai_config.lock().map_err(|e| e.to_string())?.clone();
        (schema, config)
    };

    let config = config.ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let system_prompt = PromptBuilder::fix_error_system(&schema_context);
    let user_content = format!("SQL:\n```sql\n{}\n```\n\nError:\n{}", sql, error);
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: user_content,
        },
    ];

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 2048,
        temperature: 0.1,
    };

    let response = provider.chat_completion(messages, options).await?;
    let fixed_sql = extract_sql_from_response(&response);

    Ok(AiResponse {
        content: response,
        sql: fixed_sql,
    })
}

#[tauri::command]
pub async fn ai_optimize_sql(
    state: State<'_, AppState>,
    db_id: String,
    sql: String,
) -> Result<AiResponse, String> {
    let (schema_context, config) = {
        let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
        let conn = manager.get(&db_id)?;
        let schema = SchemaContext::from_connection(conn).map_err(|e| e.to_string())?;
        let config = state.ai_config.lock().map_err(|e| e.to_string())?.clone();
        (schema, config)
    };

    let config = config.ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let system_prompt = PromptBuilder::optimize_sql_system(&schema_context);
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: format!("请分析并优化以下 SQL 查询:\n```sql\n{}\n```", sql),
        },
    ];

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 4096,
        temperature: 0.2,
    };

    let response = provider.chat_completion(messages, options).await?;
    let optimized_sql = extract_sql_from_response(&response);

    Ok(AiResponse {
        content: response,
        sql: optimized_sql,
    })
}

#[tauri::command]
pub fn explain_query(
    state: State<'_, AppState>,
    db_id: String,
    sql: String,
) -> Result<Vec<serde_json::Value>, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id)?;

    let explain_sql = format!("EXPLAIN QUERY PLAN {}", sql);
    let mut stmt = conn.prepare(&explain_sql).map_err(|e| e.to_string())?;

    let rows: Vec<serde_json::Value> = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, i64>(0).unwrap_or(0),
                "parent": row.get::<_, i64>(1).unwrap_or(0),
                "notused": row.get::<_, i64>(2).unwrap_or(0),
                "detail": row.get::<_, String>(3).unwrap_or_default(),
            }))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(rows)
}

#[tauri::command]
pub async fn ai_analyze_table(
    state: State<'_, AppState>,
    db_id: String,
    table_name: String,
) -> Result<AiResponse, String> {
    let (schema_context, table_stats, config) = {
        let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
        let conn = manager.get(&db_id)?;
        let schema = SchemaContext::from_connection(conn).map_err(|e| e.to_string())?;

        let mut stats = String::new();

        let mut col_stmt = conn
            .prepare(&format!("PRAGMA table_info(\"{}\")", table_name))
            .map_err(|e| e.to_string())?;
        let columns: Vec<(String, String)> = col_stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                ))
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        let row_count: i64 = conn
            .query_row(
                &format!("SELECT COUNT(*) FROM \"{}\"", table_name),
                [],
                |row| row.get(0),
            )
            .unwrap_or(0);

        stats.push_str(&format!("Table: {}\nTotal rows: {}\n\n", table_name, row_count));

        for (col_name, col_type) in &columns {
            let null_count: i64 = conn
                .query_row(
                    &format!(
                        "SELECT COUNT(*) FROM \"{}\" WHERE \"{}\" IS NULL",
                        table_name, col_name
                    ),
                    [],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            let distinct_count: i64 = conn
                .query_row(
                    &format!(
                        "SELECT COUNT(DISTINCT \"{}\") FROM \"{}\"",
                        col_name, table_name
                    ),
                    [],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            stats.push_str(&format!(
                "Column: {} ({})\n  Null: {}/{} ({:.1}%)\n  Distinct: {}\n",
                col_name,
                col_type,
                null_count,
                row_count,
                if row_count > 0 {
                    null_count as f64 / row_count as f64 * 100.0
                } else {
                    0.0
                },
                distinct_count,
            ));
        }

        let sample_sql = format!(
            "SELECT * FROM \"{}\" ORDER BY RANDOM() LIMIT 5",
            table_name
        );
        if let Ok(mut sample_stmt) = conn.prepare(&sample_sql) {
            let col_count = sample_stmt.column_count();
            let col_names: Vec<String> = (0..col_count)
                .map(|i| sample_stmt.column_name(i).unwrap_or("?").to_string())
                .collect();
            stats.push_str(&format!("\nSample data (5 rows):\n{}\n", col_names.join(" | ")));

            if let Ok(mut rows) = sample_stmt.query([]) {
                while let Ok(Some(row)) = rows.next() {
                    let vals: Vec<String> = (0..col_count)
                        .map(|i| {
                            row.get::<_, String>(i)
                                .unwrap_or_else(|_| "NULL".to_string())
                        })
                        .collect();
                    stats.push_str(&format!("{}\n", vals.join(" | ")));
                }
            }
        }

        let config = state.ai_config.lock().map_err(|e| e.to_string())?.clone();
        (schema, stats, config)
    };

    let config = config.ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let system_prompt = PromptBuilder::analyze_table_system(&schema_context);
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: format!(
                "请分析以下表的结构和数据特征:\n\n{}",
                table_stats
            ),
        },
    ];

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 4096,
        temperature: 0.3,
    };

    let response = provider.chat_completion(messages, options).await?;

    Ok(AiResponse {
        content: response,
        sql: None,
    })
}

#[tauri::command]
pub async fn ai_data_qa(
    state: State<'_, AppState>,
    db_id: String,
    question: String,
    conversation_history: Vec<ChatMessage>,
) -> Result<AiResponse, String> {
    let (schema_context, config) = {
        let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
        let conn = manager.get(&db_id)?;
        let schema = SchemaContext::from_connection(conn).map_err(|e| e.to_string())?;
        let config = state.ai_config.lock().map_err(|e| e.to_string())?.clone();
        (schema, config)
    };

    let config = config.ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let system_prompt = PromptBuilder::data_qa_system(&schema_context);
    let mut messages = vec![ChatMessage {
        role: "system".to_string(),
        content: system_prompt,
    }];

    for msg in &conversation_history {
        messages.push(ChatMessage {
            role: msg.role.clone(),
            content: msg.content.clone(),
        });
    }

    messages.push(ChatMessage {
        role: "user".to_string(),
        content: question,
    });

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 4096,
        temperature: 0.3,
    };

    let response = provider.chat_completion(messages, options).await?;
    let sql = extract_sql_from_response(&response);

    Ok(AiResponse { content: response, sql })
}

#[tauri::command]
pub async fn ai_summarize_results(
    state: State<'_, AppState>,
    question: String,
    sql: String,
    results: String,
) -> Result<AiResponse, String> {
    let config = state
        .ai_config
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "AI not configured".to_string())?;

    let platforms = get_builtin_platforms();
    let platform = platforms
        .iter()
        .find(|p| p.id == config.platform_id)
        .ok_or_else(|| "Platform not found".to_string())?;

    let provider = create_provider(
        platform,
        &config.api_key,
        if config.custom_base_url.is_empty() {
            None
        } else {
            Some(config.custom_base_url.as_str())
        },
    );

    let system_prompt = PromptBuilder::summarize_results_system().to_string();
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: format!(
                "用户问题: {}\n\n执行的 SQL:\n```sql\n{}\n```\n\n查询结果:\n{}",
                question, sql, results
            ),
        },
    ];

    let options = CompletionOptions {
        model: config.model.clone(),
        max_tokens: 2048,
        temperature: 0.3,
    };

    let response = provider.chat_completion(messages, options).await?;

    Ok(AiResponse {
        content: response,
        sql: None,
    })
}

#[tauri::command]
pub async fn save_ai_config(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
    config: AiProviderConfig,
) -> Result<(), String> {
    let store_config = serde_json::json!({
        "platform_id": config.platform_id,
        "model": config.model,
        "custom_base_url": config.custom_base_url,
        "custom_headers": config.custom_headers,
    });

    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    store.set("ai_config", store_config);

    let mut ai_config = state.ai_config.lock().map_err(|e| e.to_string())?;
    *ai_config = Some(config);

    Ok(())
}

#[tauri::command]
pub fn get_ai_config(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<Option<serde_json::Value>, String> {
    let ai_config = state.ai_config.lock().map_err(|e| e.to_string())?;
    if ai_config.is_some() {
        let config = ai_config.as_ref().unwrap();
        return Ok(Some(serde_json::json!({
            "platform_id": config.platform_id,
            "model": config.model,
            "custom_base_url": config.custom_base_url,
            "custom_headers": config.custom_headers,
        })));
    }

    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    Ok(store.get("ai_config"))
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 设置任务栏角标
/// 直接接收前端 Canvas 生成的 RGBA 数据
#[tauri::command]
async fn set_badge_count(window: tauri::Window, count: u32, rgba: Option<Vec<u8>>, width: Option<u32>, height: Option<u32>) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        if count == 0 || rgba.is_none() {
            // 清除角标
            window.set_overlay_icon(None)
                .map_err(|e| format!("Failed to clear overlay icon: {}", e))?;
        } else {
            // 获取数据
            let rgba_data = rgba.unwrap();
            let w = width.unwrap_or(0);
            let h = height.unwrap_or(0);
            
            if w == 0 || h == 0 {
                return Err("Invalid image dimensions".to_string());
            }

            // 直接使用 RGBA 数据创建 Tauri Image
            let icon = tauri::image::Image::new_owned(rgba_data, w, h);
            
            // 设置 overlay icon
            window.set_overlay_icon(Some(icon))
                .map_err(|e| format!("Failed to set overlay icon: {}", e))?;
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        // 在非 Windows 平台，可以尝试使用 set_badge
        let _ = count; 
        let _ = rgba;
        let _ = width;
        let _ = height;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, set_badge_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

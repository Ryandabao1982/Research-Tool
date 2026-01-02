use tauri::State;
use serde::{Deserialize, Serialize};
use crate::services::db_service::DbState;
use crate::services::role_service::{RoleService, DashboardLayout};

/// Request payload for saving dashboard layout
#[derive(Debug, Deserialize)]
pub struct SaveLayoutRequest {
    pub role: String,
    pub widget_order: Vec<String>,
}

/// Response payload for loading dashboard layout
#[derive(Debug, Serialize)]
pub struct LoadLayoutResponse {
    pub success: bool,
    pub layout: Option<DashboardLayout>,
    pub message: Option<String>,
}

/// Response payload for save operation
#[derive(Debug, Serialize)]
pub struct SaveLayoutResponse {
    pub success: bool,
    pub message: Option<String>,
}

/// Save dashboard layout for a role
/// 
/// # Arguments
/// * `db_state` - Database state managed by Tauri
/// * `request` - Save layout request containing role and widget order
/// 
/// # Returns
/// SaveLayoutResponse indicating success or failure
#[tauri::command]
pub async fn save_dashboard_layout(
    db_state: State<'_, DbState>,
    request: SaveLayoutRequest,
) -> Result<SaveLayoutResponse, String> {
    match RoleService::save_layout(&db_state, &request.role, &request.widget_order) {
        Ok(()) => Ok(SaveLayoutResponse {
            success: true,
            message: Some("Layout saved successfully".to_string()),
        }),
        Err(e) => Ok(SaveLayoutResponse {
            success: false,
            message: Some(e),
        }),
    }
}

/// Load dashboard layout for a role
/// 
/// # Arguments
/// * `db_state` - Database state managed by Tauri
/// * `role` - The role to load layout for
/// 
/// # Returns
/// LoadLayoutResponse containing the layout or error message
#[tauri::command]
pub async fn load_dashboard_layout(
    db_state: State<'_, DbState>,
    role: String,
) -> Result<LoadLayoutResponse, String> {
    match RoleService::load_layout(&db_state, &role) {
        Ok(layout) => Ok(LoadLayoutResponse {
            success: true,
            layout: Some(layout),
            message: None,
        }),
        Err(e) => Ok(LoadLayoutResponse {
            success: false,
            layout: None,
            message: Some(e),
        }),
    }
}

/// Reset dashboard layout to default for a role
/// 
/// # Arguments
/// * `db_state` - Database state managed by Tauri
/// * `role` - The role to reset layout for
/// 
/// # Returns
/// SaveLayoutResponse indicating success or failure
#[tauri::command]
pub async fn reset_dashboard_layout(
    db_state: State<'_, DbState>,
    role: String,
) -> Result<SaveLayoutResponse, String> {
    match RoleService::reset_layout(&db_state, &role) {
        Ok(()) => Ok(SaveLayoutResponse {
            success: true,
            message: Some("Layout reset to default".to_string()),
        }),
        Err(e) => Ok(SaveLayoutResponse {
            success: false,
            message: Some(e),
        }),
    }
}

/// Get all dashboard layouts (for admin/debugging)
/// 
/// # Arguments
/// * `db_state` - Database state managed by Tauri
/// 
/// # Returns
/// List of all dashboard layouts
#[tauri::command]
pub async fn get_all_dashboard_layouts(
    db_state: State<'_, DbState>,
) -> Result<Vec<DashboardLayout>, String> {
    RoleService::get_all_layouts(&db_state)
}

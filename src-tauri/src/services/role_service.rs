use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::services::db_service::DbState;

/// Dashboard layout structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DashboardLayout {
    pub role: String,
    pub widget_order: Vec<String>,
    pub updated_at: String,
}

/// Role service for managing role-based dashboard layouts
pub struct RoleService;

impl RoleService {
    /// Save dashboard layout for a specific role
    pub fn save_layout(
        db_state: &DbState,
        role: &str,
        widget_order: &[String],
    ) -> Result<(), String> {
        let conn = db_state.0.lock().map_err(|e| e.to_string())?;
        
        // Validate widget_order is not empty
        if widget_order.is_empty() {
            return Err("Widget order cannot be empty".to_string());
        }
        
        // Validate role is one of the supported roles
        let valid_roles = ["manager", "coach", "learner"];
        if !valid_roles.contains(&role) {
            return Err(format!("Invalid role: {}", role));
        }
        
        // Serialize widget_order to JSON
        let widget_order_json = serde_json::to_string(widget_order)
            .map_err(|e| format!("Failed to serialize widget order: {}", e))?;
        
        // Insert or update the layout
        conn.execute(
            "INSERT OR REPLACE INTO role_dashboard_layouts (role, widget_order, updated_at) 
             VALUES (?, ?, CURRENT_TIMESTAMP)",
            &[&role, &widget_order_json],
        ).map_err(|e| format!("Failed to save layout: {}", e))?;
        
        Ok(())
    }
    
    /// Load dashboard layout for a specific role
    pub fn load_layout(
        db_state: &DbState,
        role: &str,
    ) -> Result<DashboardLayout, String> {
        let conn = db_state.0.lock().map_err(|e| e.to_string())?;
        
        // Try to get the layout from database
        let result = conn.query_row(
            "SELECT role, widget_order, updated_at FROM role_dashboard_layouts WHERE role = ?",
            &[&role],
            |row| {
                let role: String = row.get(0)?;
                let widget_order_json: String = row.get(1)?;
                let updated_at: String = row.get(2)?;
                
                let widget_order: Vec<String> = serde_json::from_str(&widget_order_json)
                    .unwrap_or_else(|_| Vec::new());
                
                Ok(DashboardLayout {
                    role,
                    widget_order,
                    updated_at,
                })
            },
        );
        
        match result {
            Ok(layout) => Ok(layout),
            Err(rusqlite::Error::QueryReturnedNoRows) => {
                // Return default layout based on role
                let default_layout = match role {
                    "manager" => vec!["tasks-padding".to_string(), "project-deadlines".to_string()],
                    "learner" => vec!["spaced-repetition".to_string(), "reading-list".to_string()],
                    "coach" => Vec::new(),
                    _ => Vec::new(),
                };
                
                Ok(DashboardLayout {
                    role: role.to_string(),
                    widget_order: default_layout,
                    updated_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
                })
            }
            Err(e) => Err(format!("Failed to load layout: {}", e)),
        }
    }
    
    /// Get all layouts (useful for admin/debugging)
    pub fn get_all_layouts(
        db_state: &DbState,
    ) -> Result<Vec<DashboardLayout>, String> {
        let conn = db_state.0.lock().map_err(|e| e.to_string())?;
        
        let mut stmt = conn.prepare(
            "SELECT role, widget_order, updated_at FROM role_dashboard_layouts ORDER BY role"
        ).map_err(|e| format!("Failed to prepare query: {}", e))?;
        
        let layouts = stmt.query_map([], |row| {
            let role: String = row.get(0)?;
            let widget_order_json: String = row.get(1)?;
            let updated_at: String = row.get(2)?;
            
            let widget_order: Vec<String> = serde_json::from_str(&widget_order_json)
                .unwrap_or_else(|_| Vec::new());
            
            Ok(DashboardLayout {
                role,
                widget_order,
                updated_at,
            })
        }).map_err(|e| format!("Failed to query layouts: {}", e))?;
        
        layouts.collect::<Result<Vec<_>, _>>()
            .map_err(|e| format!("Failed to collect layouts: {}", e))
    }
    
    /// Delete layout for a role (useful for testing/resetting)
    pub fn delete_layout(
        db_state: &DbState,
        role: &str,
    ) -> Result<(), String> {
        let conn = db_state.0.lock().map_err(|e| e.to_string())?;
        
        conn.execute(
            "DELETE FROM role_dashboard_layouts WHERE role = ?",
            &[&role],
        ).map_err(|e| format!("Failed to delete layout: {}", e))?;
        
        Ok(())
    }
    
    /// Reset layout to default for a role
    pub fn reset_layout(
        db_state: &DbState,
        role: &str,
    ) -> Result<(), String> {
        // Delete existing layout
        let _ = Self::delete_layout(db_state, role);
        
        // Re-insert default
        let default_layout = match role {
            "manager" => vec!["tasks-padding".to_string(), "project-deadlines".to_string()],
            "learner" => vec!["spaced-repetition".to_string(), "reading-list".to_string()],
            "coach" => Vec::new(),
            _ => Vec::new(),
        };
        
        Self::save_layout(db_state, role, &default_layout)
    }
}

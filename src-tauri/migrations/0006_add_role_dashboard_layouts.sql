-- Add role-based dashboard layout persistence
-- Migration for Story 3.2: Context-Aware Dashboard Configuration

-- Create table for role-specific dashboard layouts
CREATE TABLE IF NOT EXISTS role_dashboard_layouts (
    role TEXT PRIMARY KEY,
    widget_order TEXT NOT NULL,  -- JSON array of widget IDs
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_role_dashboard_layouts_role ON role_dashboard_layouts(role);

-- Insert default layouts for existing roles
-- Manager: Tasks Padding, Project Deadlines
INSERT OR IGNORE INTO role_dashboard_layouts (role, widget_order) 
VALUES ('manager', '["tasks-padding", "project-deadlines"]');

-- Learner: Spaced Repetition Queue, Reading List
INSERT OR IGNORE INTO role_dashboard_layouts (role, widget_order) 
VALUES ('learner', '["spaced-repetition", "reading-list"]');

-- Coach: Empty default (can be customized)
INSERT OR IGNORE INTO role_dashboard_layouts (role, widget_order) 
VALUES ('coach', '[]');

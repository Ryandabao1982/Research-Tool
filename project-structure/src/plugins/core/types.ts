/**
 * Core Plugin System Types
 * 
 * This module defines the foundational types for the KnowledgeBase Pro plugin system,
 * following the Global Vibe Coding Constitution standards for type safety and
 * comprehensive documentation.
 * 
 * @module plugins/core/types
 * @author KnowledgeBase Pro Team
 * @version 2.0.0
 */

import React from 'react';
import {
    Note, SearchResult, AIRequest, AIResponse,
    Folder, Tag, Link,
    NoteService, SearchService, AIService,
    FileSystemService, DatabaseService,
    FolderService, TagService, LinkService
} from '@/shared/types';

/**
 * Base interface for all KnowledgeBase Pro plugins.
 * Every plugin must implement this interface to be compatible with the system.
 * 
 * @example
 * ```typescript
 * class MyPlugin implements KnowledgeBasePlugin {
 *   id = 'my-plugin';
 *   name = 'My Awesome Plugin';
 *   version = '1.0.0';
 *   // ... implement other required properties
 * }
 * ```
 */
export interface KnowledgeBasePlugin {
    /** Unique plugin identifier following kebab-case pattern */
    id: string;

    /** Human-readable plugin name for UI display */
    name: string;

    /** Plugin version following semantic versioning (semver) */
    version: string;

    /** Comprehensive plugin description for user understanding */
    description: string;

    /** Plugin author information */
    author: string;

    /** Minimum required KnowledgeBase application version */
    minAppVersion: string;

    /** Plugin permissions and capabilities required for operation */
    permissions: PluginPermission[];

    /** Plugin lifecycle hooks for system integration */
    hooks: PluginHooks;

    /** JSON Schema for plugin configuration validation */
    configSchema?: JSONSchema;

    /** Plugin initialization method called when plugin is loaded */
    initialize(context: PluginContext): Promise<void>;

    /** Plugin cleanup method called when plugin is unloaded */
    dispose(): Promise<void>;
}

/**
 * Plugin lifecycle hooks for different application events
 * 
 * These hooks allow plugins to respond to various application events and
 * extend functionality without modifying core application code.
 */
export interface PluginHooks {
    /**
     * Called when a new note is created
     * @param note - The newly created note object
     */
    onNoteCreate?(note: Note): Promise<void>;

    /**
     * Called when a note is updated
     * @param note - The updated note object
     */
    onNoteUpdate?(note: Note): Promise<void>;

    /**
     * Called when a note is deleted
     * @param noteId - The ID of the deleted note
     */
    onNoteDelete?(noteId: string): Promise<void>;

    /**
     * Called when a search operation is performed
     * @param query - The search query string
     * @param results - Current search results
     * @returns Modified search results
     */
    onSearch?(query: string, results: SearchResult[]): Promise<SearchResult[]>;

    /**
     * Called when AI generates a response
     * @param request - The original AI request
     * @param response - The AI response before modification
     * @returns Modified AI response
     */
    onAIResponse?(request: AIRequest, response: AIResponse): Promise<AIResponse>;

    /**
     * Called when UI is rendered for plugin UI components
     * @param container - The DOM container for plugin UI
     */
    onUIRender?(container: HTMLElement): Promise<void>;

    /**
     * Called when application starts up
     */
    onAppStart?(): Promise<void>;

    /**
     * Called when application shuts down
     */
    onAppStop?(): Promise<void>;

    /**
     * Called when folder structure changes
     * @param folder - The affected folder
     * @param action - The action performed on the folder
     */
    onFolderChange?(folder: Folder, action: 'create' | 'update' | 'delete'): Promise<void>;

    /**
     * Called when tags are modified
     * @param tag - The affected tag
     * @param action - The action performed on the tag
     */
    onTagChange?(tag: Tag, action: 'create' | 'update' | 'delete'): Promise<void>;

    /**
     * Called when links between notes are created or removed
     * @param link - The affected link
     * @param action - The action performed on the link
     */
    onLinkChange?(link: Link, action: 'create' | 'delete'): Promise<void>;
}

/**
 * Plugin permissions and capabilities enumeration
 * 
 * Defines the scope of access and operations a plugin is allowed to perform.
 * Following principle of least privilege - plugins should request only
 * the minimum permissions they need.
 */
export enum PluginPermission {
    /** Access to user notes and content for reading */
    READ_NOTES = 'read_notes',

    /** Modify user notes and content */
    WRITE_NOTES = 'write_notes',

    /** Access to AI services for generating content and analysis */
    USE_AI = 'use_ai',

    /** Access to file system for import/export operations */
    FILE_ACCESS = 'file_access',

    /** Network access for external service integrations */
    NETWORK_ACCESS = 'network_access',

    /** Access to user interface for rendering custom components */
    UI_ACCESS = 'ui_access',

    /** Access to database for direct queries and modifications */
    DATABASE_ACCESS = 'database_access',

    /** Access to other plugins and their services */
    PLUGIN_ACCESS = 'plugin_access',

    /** Access to user settings and configuration */
    SETTINGS_ACCESS = 'settings_access',

    /** Access to real-time event system */
    EVENT_ACCESS = 'event_access'
}

/**
 * Plugin context provided during initialization
 * 
 * Provides access to core application services and functionality
 * that plugins can use to integrate with the system.
 */
export interface PluginContext {
    /** Application services registry */
    services: PluginServices;

    /** Plugin configuration manager */
    config: PluginConfig;

    /** User interface service for notifications and dialogs */
    ui: PluginUIService;

    /** Event system for subscribing to application events */
    events: PluginEventService;

    /** Logger for plugin-specific logging */
    logger: PluginLogger;
}

/**
 * Core services available to plugins
 */
export interface PluginServices {
    /** Note management service */
    notes: NoteService;

    /** Search service */
    search: SearchService;

    /** AI and LLM service */
    ai: AIService;

    /** File system service */
    fs: FileSystemService;

    /** Database service */
    database: DatabaseService;

    /** Folder management service */
    folders: FolderService;

    /** Tag management service */
    tags: TagService;

    /** Link management service */
    links: LinkService;
}

/**
 * Plugin configuration management interface
 */
export interface PluginConfig {
    /** Get configuration value */
    get<T = any>(key: string, defaultValue?: T): T;

    /** Set configuration value */
    set<T = any>(key: string, value: T): Promise<void>;

    /** Delete configuration value */
    delete(key: string): Promise<void>;

    /** Subscribe to configuration changes */
    onChange(callback: (key: string, oldValue: any, newValue: any) => void): () => void;
}

/**
 * Plugin UI service for user interface interactions
 */
export interface PluginUIService {
    /** Show notification to user */
    showNotification(
        message: string,
        type: 'info' | 'success' | 'warning' | 'error',
        options?: NotificationOptions
    ): void;

    /** Show modal dialog */
    showModal(component: React.ComponentType, props?: any): Promise<any>;

    /** Show confirm dialog */
    showConfirm(message: string, title?: string): Promise<boolean>;

    /** Create and mount UI component */
    createComponent(
        component: React.ComponentType,
        container: HTMLElement,
        props?: any
    ): React.ReactInstance;
}

/**
 * Plugin event service for subscribing to application events
 */
export interface PluginEventService {
    /** Subscribe to event */
    on<T = any>(event: string, callback: (data: T) => void): () => void;

    /** Emit event */
    emit<T = any>(event: string, data: T): void;

    /** Subscribe once to event */
    once<T = any>(event: string, callback: (data: T) => void): () => void;
}

/**
 * Plugin logger for debugging and monitoring
 */
export interface PluginLogger {
    /** Log debug message */
    debug(message: string, ...args: any[]): void;

    /** Log info message */
    info(message: string, ...args: any[]): void;

    /** Log warning message */
    warn(message: string, ...args: any[]): void;

    /** Log error message */
    error(message: string, ...args: any[]): void;
}

/**
 * JSON Schema type for configuration validation
 */
export interface JSONSchema {
    type?: string;
    properties?: Record<string, JSONSchema>;
    required?: string[];
    items?: JSONSchema;
    enum?: any[];
    default?: any;
    description?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}

/**
 * Notification options for UI service
 */
export interface NotificationOptions {
    /** Notification duration in milliseconds */
    duration?: number;

    /** Action buttons for user interaction */
    actions?: NotificationAction[];

    /** Whether notification requires user action */
    persistent?: boolean;
}

/**
 * Notification action button
 */
export interface NotificationAction {
    /** Action button label */
    label: string;

    /** Action handler */
    action: () => void | Promise<void>;

    /** Action button style */
    style?: 'primary' | 'secondary' | 'danger';
}

// Re-export commonly used types from other modules
export type { Note, SearchResult, AIRequest, AIResponse, Folder, Tag, Link } from '@/shared/types';

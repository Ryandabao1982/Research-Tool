import { ReactNode } from 'react';
import { UserRole } from '../../../shared/stores/role-store';

// Import widget components
import TasksPaddingWidget from './manager-widgets/TasksPaddingWidget';
import ProjectDeadlinesWidget from './manager-widgets/ProjectDeadlinesWidget';
import SpacedRepetitionWidget from './learner-widgets/SpacedRepetitionWidget';
import ReadingListWidget from './learner-widgets/ReadingListWidget';

/**
 * Widget metadata interface
 */
export interface WidgetMetadata {
    id: string;
    name: string;
    description: string;
    component: React.ComponentType<any>;
    roles: UserRole[];
    defaultSize?: { width: number; height: number };
}

/**
 * Centralized widget registry with role-based filtering
 * 
 * Each widget is registered with:
 * - Unique ID for layout persistence
 * - Display name
 * - Component reference
 * - Array of roles that can see this widget
 */
export const widgetRegistry: Record<string, WidgetMetadata> = {
    'tasks-padding': {
        id: 'tasks-padding',
        name: 'Tasks Padding',
        description: 'Manager-focused task management with padding analysis',
        component: TasksPaddingWidget,
        roles: ['manager'],
        defaultSize: { width: 1, height: 1 }
    },
    'project-deadlines': {
        id: 'project-deadlines',
        name: 'Project Deadlines',
        description: 'Upcoming project deadlines and milestones',
        component: ProjectDeadlinesWidget,
        roles: ['manager'],
        defaultSize: { width: 1, height: 1 }
    },
    'spaced-repetition': {
        id: 'spaced-repetition',
        name: 'Spaced Repetition Queue',
        description: 'Learning items due for review',
        component: SpacedRepetitionWidget,
        roles: ['learner'],
        defaultSize: { width: 1, height: 1 }
    },
    'reading-list': {
        id: 'reading-list',
        name: 'Reading List',
        description: 'Articles and notes to read',
        component: ReadingListWidget,
        roles: ['learner'],
        defaultSize: { width: 1, height: 1 }
    }
};

/**
 * Get all widgets available for a specific role
 */
export function getWidgetsForRole(role: UserRole): WidgetMetadata[] {
    return Object.values(widgetRegistry).filter(widget => 
        widget.roles.includes(role)
    );
}

/**
 * Get a specific widget by ID
 */
export function getWidgetById(id: string): WidgetMetadata | undefined {
    return widgetRegistry[id];
}

/**
 * Get widget component by ID
 */
export function getWidgetComponent(id: string): React.ComponentType<any> | null {
    const widget = widgetRegistry[id];
    return widget ? widget.component : null;
}

/**
 * Get lazy import function for widget
 * Used for code splitting
 */
export function getWidgetImport(id: string): (() => Promise<any>) | null {
    switch (id) {
        case 'tasks-padding':
            return () => import('./manager-widgets/TasksPaddingWidget');
        case 'project-deadlines':
            return () => import('./manager-widgets/ProjectDeadlinesWidget');
        case 'spaced-repetition':
            return () => import('./learner-widgets/SpacedRepetitionWidget');
        case 'reading-list':
            return () => import('./learner-widgets/ReadingListWidget');
        default:
            return null;
    }
}

/**
 * Check if a widget is available for a role
 */
export function isWidgetAvailableForRole(widgetId: string, role: UserRole): boolean {
    const widget = widgetRegistry[widgetId];
    return widget ? widget.roles.includes(role) : false;
}

/**
 * Get all available widget IDs for a role
 */
export function getAvailableWidgetIdsForRole(role: UserRole): string[] {
    return Object.values(widgetRegistry)
        .filter(widget => widget.roles.includes(role))
        .map(widget => widget.id);
}

/**
 * Validate layout against available widgets for a role
 * Filters out invalid widgets and returns only valid ones
 */
export function validateLayoutForRole(
    layout: string[],
    role: UserRole
): string[] {
    return layout.filter(widgetId => 
        isWidgetAvailableForRole(widgetId, role)
    );
}

/**
 * Get default layout for a role
 */
export function getDefaultLayoutForRole(role: UserRole): string[] {
    switch (role) {
        case 'manager':
            return ['tasks-padding', 'project-deadlines'];
        case 'learner':
            return ['spaced-repetition', 'reading-list'];
        case 'coach':
            return [];
        default:
            return [];
    }
}

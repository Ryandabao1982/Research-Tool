import {
    getWidgetsForRole,
    getWidgetById,
    getWidgetComponent,
    isWidgetAvailableForRole,
    getAvailableWidgetIdsForRole,
    validateLayoutForRole,
    getDefaultLayoutForRole,
    widgetRegistry
} from './WidgetRegistry';
import { describe, it, expect } from 'vitest';

describe('WidgetRegistry', () => {
    describe('getWidgetsForRole', () => {
        it('should return manager widgets for manager role', () => {
            const widgets = getWidgetsForRole('manager');
            expect(widgets).toHaveLength(2);
            expect(widgets.map(w => w.id)).toContain('tasks-padding');
            expect(widgets.map(w => w.id)).toContain('project-deadlines');
        });

        it('should return learner widgets for learner role', () => {
            const widgets = getWidgetsForRole('learner');
            expect(widgets).toHaveLength(2);
            expect(widgets.map(w => w.id)).toContain('spaced-repetition');
            expect(widgets.map(w => w.id)).toContain('reading-list');
        });

        it('should return empty array for coach role', () => {
            const widgets = getWidgetsForRole('coach');
            expect(widgets).toHaveLength(0);
        });
    });

    describe('getWidgetById', () => {
        it('should return widget metadata for valid ID', () => {
            const widget = getWidgetById('tasks-padding');
            expect(widget).toBeDefined();
            expect(widget?.name).toBe('Tasks Padding');
            expect(widget?.roles).toContain('manager');
        });

        it('should return undefined for invalid ID', () => {
            const widget = getWidgetById('invalid-widget');
            expect(widget).toBeUndefined();
        });
    });

    describe('getWidgetComponent', () => {
        it('should return component function for valid widget', () => {
            const component = getWidgetComponent('tasks-padding');
            expect(component).toBeDefined();
            expect(typeof component).toBe('function');
        });

        it('should return null for invalid widget', () => {
            const component = getWidgetComponent('invalid-widget');
            expect(component).toBeNull();
        });
    });

    describe('isWidgetAvailableForRole', () => {
        it('should return true for manager widget with manager role', () => {
            expect(isWidgetAvailableForRole('tasks-padding', 'manager')).toBe(true);
        });

        it('should return false for manager widget with learner role', () => {
            expect(isWidgetAvailableForRole('tasks-padding', 'learner')).toBe(false);
        });

        it('should return false for invalid widget', () => {
            expect(isWidgetAvailableForRole('invalid-widget', 'manager')).toBe(false);
        });
    });

    describe('getAvailableWidgetIdsForRole', () => {
        it('should return correct IDs for manager', () => {
            const ids = getAvailableWidgetIdsForRole('manager');
            expect(ids).toEqual(['tasks-padding', 'project-deadlines']);
        });

        it('should return correct IDs for learner', () => {
            const ids = getAvailableWidgetIdsForRole('learner');
            expect(ids).toEqual(['spaced-repetition', 'reading-list']);
        });

        it('should return empty array for coach', () => {
            const ids = getAvailableWidgetIdsForRole('coach');
            expect(ids).toEqual([]);
        });
    });

    describe('validateLayoutForRole', () => {
        it('should filter out invalid widgets for role', () => {
            const layout = ['tasks-padding', 'spaced-repetition', 'project-deadlines'];
            const validated = validateLayoutForRole(layout, 'manager');
            expect(validated).toEqual(['tasks-padding', 'project-deadlines']);
        });

        it('should return empty array if no valid widgets', () => {
            const layout = ['spaced-repetition', 'reading-list'];
            const validated = validateLayoutForRole(layout, 'manager');
            expect(validated).toEqual([]);
        });

        it('should preserve order of valid widgets', () => {
            const layout = ['project-deadlines', 'tasks-padding'];
            const validated = validateLayoutForRole(layout, 'manager');
            expect(validated).toEqual(['project-deadlines', 'tasks-padding']);
        });
    });

    describe('getDefaultLayoutForRole', () => {
        it('should return correct default for manager', () => {
            const layout = getDefaultLayoutForRole('manager');
            expect(layout).toEqual(['tasks-padding', 'project-deadlines']);
        });

        it('should return correct default for learner', () => {
            const layout = getDefaultLayoutForRole('learner');
            expect(layout).toEqual(['spaced-repetition', 'reading-list']);
        });

        it('should return empty array for coach', () => {
            const layout = getDefaultLayoutForRole('coach');
            expect(layout).toEqual([]);
        });

        it('should return empty array for unknown role', () => {
            const layout = getDefaultLayoutForRole('unknown' as any);
            expect(layout).toEqual([]);
        });
    });

    describe('widgetRegistry structure', () => {
        it('should have all required widget properties', () => {
            Object.values(widgetRegistry).forEach(widget => {
                expect(widget).toHaveProperty('id');
                expect(widget).toHaveProperty('name');
                expect(widget).toHaveProperty('description');
                expect(widget).toHaveProperty('component');
                expect(widget).toHaveProperty('roles');
                expect(Array.isArray(widget.roles)).toBe(true);
            });
        });

        it('should have unique widget IDs', () => {
            const ids = Object.keys(widgetRegistry);
            const uniqueIds = new Set(ids);
            expect(ids.length).toBe(uniqueIds.size);
        });

        it('should have valid role assignments', () => {
            const validRoles = ['manager', 'coach', 'learner'];
            Object.values(widgetRegistry).forEach(widget => {
                widget.roles.forEach(role => {
                    expect(validRoles).toContain(role);
                });
            });
        });
    });
});

/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DraggableWidgetContainer } from './DraggableWidgetContainer';
import { describe, it, expect, vi } from 'vitest';

describe('DraggableWidgetContainer', () => {
    const defaultProps = {
        widgetId: 'test-widget',
        children: <div>Test Content</div>,
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        index: 0,
        isDragging: false,
        className: '',
    };

    it('should render children', () => {
        render(<DraggableWidgetContainer {...defaultProps} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should show index badge', () => {
        render(<DraggableWidgetContainer {...defaultProps} index={2} />);
        expect(screen.getByText('3')).toBeInTheDocument(); // index + 1
    });

    it('should call onDragStart when drag starts', () => {
        render(<DraggableWidgetContainer {...defaultProps} />);
        
        const container = screen.getByText('Test Content').closest('div[draggable="true"]');
        fireEvent.dragStart(container!);

        expect(defaultProps.onDragStart).toHaveBeenCalledWith('test-widget');
    });

    it('should call onDragEnd when drag ends', () => {
        render(<DraggableWidgetContainer {...defaultProps} />);
        
        const container = screen.getByText('Test Content').closest('div[draggable="true"]');
        fireEvent.dragEnd(container!);

        expect(defaultProps.onDragEnd).toHaveBeenCalled();
    });

    it('should handle drop event', () => {
        const onDragEnd = vi.fn();
        render(<DraggableWidgetContainer {...defaultProps} onDragEnd={onDragEnd} index={1} />);
        
        const container = screen.getByText('Test Content').closest('div[draggable="true"]');
        
        // Simulate drop with different widget ID
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
                getData: (type: string) => 'other-widget-id',
                preventDefault: vi.fn(),
            },
        });
        
        fireEvent(container!, dropEvent);

        expect(onDragEnd).toHaveBeenCalledWith('other-widget-id', 1);
    });

    it('should not call onDragEnd if dropping on itself', () => {
        const onDragEnd = vi.fn();
        render(<DraggableWidgetContainer {...defaultProps} onDragEnd={onDragEnd} />);
        
        const container = screen.getByText('Test Content').closest('div[draggable="true"]');
        
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
                getData: (type: string) => 'test-widget', // Same ID
                preventDefault: vi.fn(),
            },
        });
        
        fireEvent(container!, dropEvent);

        expect(onDragEnd).not.toHaveBeenCalled();
    });

    it('should apply dragging styles when isDragging is true', () => {
        render(<DraggableWidgetContainer {...defaultProps} isDragging={true} />);
        
        const container = screen.getByText('Test Content').closest('div[class*="motion"]');
        expect(container?.className).toContain('opacity-50');
    });

    it('should show drag handle on hover', () => {
        render(<DraggableWidgetContainer {...defaultProps} />);
        
        const container = screen.getByText('Test Content').closest('div[class*="motion"]');
        fireEvent.mouseOver(container!);
        
        // The drag handle should become visible (opacity-100)
        // This is tested visually, but we can verify the structure exists
        expect(screen.getByText('⋮⋮')).toBeInTheDocument();
    });

    it('should prevent default on dragOver', () => {
        render(<DraggableWidgetContainer {...defaultProps} />);
        
        const container = screen.getByText('Test Content').closest('div[draggable="true"]');
        const dragOverEvent = new Event('dragover', { bubbles: true });
        Object.defineProperty(dragOverEvent, 'preventDefault', { value: vi.fn() });
        Object.defineProperty(dragOverEvent, 'dataTransfer', { value: { dropEffect: '' } });
        
        fireEvent(container!, dragOverEvent);

        expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });

    it('should apply custom className', () => {
        render(<DraggableWidgetContainer {...defaultProps} className="custom-class" />);
        
        const container = screen.getByText('Test Content').closest('div[class*="motion"]');
        expect(container?.className).toContain('custom-class');
    });
});

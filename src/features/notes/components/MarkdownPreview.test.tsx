/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownPreview } from './MarkdownPreview';
import { BrowserRouter } from 'react-router-dom';
import { useWikiNavigation } from '../../../shared/hooks/useWikiNavigation';

// Mock the hook
vi.mock('../../../shared/hooks/useWikiNavigation', () => ({
    useWikiNavigation: vi.fn(),
}));

describe('MarkdownPreview', () => {
    // Default mock implementation
    const mockHandleWikiLinkClick = vi.fn();
    
    beforeEach(() => {
        // @ts-ignore
        useWikiNavigation.mockReturnValue({
            handleWikiLinkClick: mockHandleWikiLinkClick
        });
        mockHandleWikiLinkClick.mockClear();
    });

    it('should render standard markdown', () => {
        render(
            <BrowserRouter>
                <MarkdownPreview content="**Bold** text" />
            </BrowserRouter>
        );
        const boldText = screen.getByText('Bold');
        expect(boldText.tagName).toBe('STRONG');
    });

    it('should call handleWikiLinkClick on link click', () => {
        render(
            <BrowserRouter>
                <MarkdownPreview content="[[My Note]]" />
            </BrowserRouter>
        );

        const link = screen.getByText('My Note');
        fireEvent.click(link);

        expect(mockHandleWikiLinkClick).toHaveBeenCalledWith('My Note');
    });
});

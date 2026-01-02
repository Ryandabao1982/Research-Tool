/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleSearchModal } from '../components/RoleSearchModal';
import { useRoleSearch } from '../hooks/useRoleSearch';

// Mock useRoleSearch
vi.mock('../hooks/useRoleSearch', () => ({
  useRoleSearch: vi.fn(),
}));

describe('RoleSearchModal', () => {
  const mockUseRoleSearch = useRoleSearch as any;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose.mockClear();
    
    // Default mock implementation
    mockUseRoleSearch.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });
  });

  it('should not render when isOpen is false', () => {
    render(<RoleSearchModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Role: manager')).toBeInTheDocument();
  });

  it('should display search input with query', () => {
    mockUseRoleSearch.mockReturnValue({
      query: 'test query',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('should call setQuery when typing', () => {
    const setQuery = vi.fn();
    mockUseRoleSearch.mockReturnValue({
      query: '',
      setQuery,
      results: [],
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'new query' } });
    
    expect(setQuery).toHaveBeenCalledWith('new query');
  });

  it('should show loading state', () => {
    mockUseRoleSearch.mockReturnValue({
      query: 'test',
      setQuery: vi.fn(),
      results: [],
      isLoading: true,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseRoleSearch.mockReturnValue({
      query: 'test',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: 'Search failed',
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/⚠️ Search failed/)).toBeInTheDocument();
  });

  it('should show empty state when no query', () => {
    mockUseRoleSearch.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/Type to search manager resources/)).toBeInTheDocument();
  });

  it('should show no results message', () => {
    mockUseRoleSearch.mockReturnValue({
      query: 'nonexistent',
      setQuery: vi.fn(),
      results: [],
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/No results found for "nonexistent"/)).toBeInTheDocument();
  });

  it('should display results', () => {
    const results = [
      { id: '1', type: 'note', title: 'Test Note', description: 'Test description', role: 'manager' },
      { id: '2', type: 'task', title: 'Test Task', description: 'Another test', role: 'manager' },
    ];

    mockUseRoleSearch.mockReturnValue({
      query: 'test',
      setQuery: vi.fn(),
      results,
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should close on Escape key', () => {
    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should navigate with arrow keys', () => {
    const results = [
      { id: '1', type: 'note', title: 'First', role: 'manager' },
      { id: '2', type: 'note', title: 'Second', role: 'manager' },
    ];

    mockUseRoleSearch.mockReturnValue({
      query: 'test',
      setQuery: vi.fn(),
      results,
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    // First result should be selected by default
    const firstResult = screen.getByText('First').closest('div');
    expect(firstResult?.className).toContain('bg-blue-50');

    // Arrow down to second result
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    
    // Second result should now be selected
    const secondResult = screen.getByText('Second').closest('div');
    expect(secondResult?.className).toContain('bg-blue-50');
  });

  it('should call onClose when clicking backdrop', () => {
    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    // Click on the backdrop (outside the modal)
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should clear query when clear button is clicked', () => {
    const setQuery = vi.fn();
    mockUseRoleSearch.mockReturnValue({
      query: 'test',
      setQuery,
      results: [],
      isLoading: false,
      error: null,
      activeRole: 'manager',
      search: vi.fn(),
    });

    render(<RoleSearchModal isOpen={true} onClose={mockOnClose} />);
    
    const clearButton = screen.getByText('✕');
    fireEvent.click(clearButton);
    
    expect(setQuery).toHaveBeenCalledWith('');
  });
});

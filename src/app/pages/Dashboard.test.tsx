/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from './Dashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
  };
});

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  it('should render the welcome message', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Welcome back, User')).toBeDefined();
  });

  it('should render quick actions section', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getAllByText('Quick Actions')[0]).toBeDefined();
    expect(screen.getAllByText('New Note')[0]).toBeDefined();
  });

  it('should navigate to notes when New Note is clicked', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    const newNoteBtn = screen.getAllByText('New Note')[0].closest('button');
    expect(newNoteBtn).toBeDefined();
    fireEvent.click(newNoteBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/notes');
  });

  it('should render stats section', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getAllByText('Total Notes')[0]).toBeDefined();
  });
});

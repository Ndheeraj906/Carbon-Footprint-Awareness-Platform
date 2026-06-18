import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useAuthStore } from './store/useAuthStore';

vi.mock('./store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock ResizeObserver for Recharts
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

describe('App Component', () => {
  it('renders login route when unauthenticated', async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false, isLoading: false });
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/EcoTrack/i)).toBeInTheDocument();
  });

  it('renders loading spinner when auth is loading', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false, isLoading: true });
    
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Look for the spinner
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

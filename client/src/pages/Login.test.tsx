import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { useAuthStore } from '../store/useAuthStore';
import * as firebaseLib from '../lib/firebase';

// Mock dependencies
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  signInWithGoogle: vi.fn(),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login button and UI correctly', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false });
    renderLogin();
    expect(screen.getByText(/EcoTrack/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
  });

  it('redirects if user is already authenticated', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: true });
    renderLogin();
    expect(screen.queryByText(/EcoTrack/i)).not.toBeInTheDocument();
  });

  it('calls signInWithGoogle on button click and sets user state', async () => {
    const mockSetUser = vi.fn();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false });
    useAuthStore.getState = vi.fn().mockReturnValue({ setUser: mockSetUser });
    
    const mockUser = { uid: '123', displayName: 'Test User' };
    (firebaseLib.signInWithGoogle as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    renderLogin();
    const loginButton = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(firebaseLib.signInWithGoogle).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message on sign in failure', async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false });
    (firebaseLib.signInWithGoogle as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Auth failed'));

    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));

    await waitFor(() => {
      expect(screen.getByText(/Auth failed/i)).toBeInTheDocument();
    });
  });
});

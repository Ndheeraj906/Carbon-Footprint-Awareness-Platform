import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));

// Initialize Firebase Auth listener safely
if (auth) {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
} else {
  // Graceful fallback for mock mode / missing config
  useAuthStore.setState({ isLoading: false });
}

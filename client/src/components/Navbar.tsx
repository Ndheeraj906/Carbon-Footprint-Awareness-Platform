import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { signOut } from '../lib/firebase';
import { Leaf, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Challenges', path: '/challenges' }
  ];

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-glass-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">EcoTrack</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-slate-400'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="h-6 w-px bg-glass-border mx-2"></div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{user?.displayName || user?.email}</span>
              <button 
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-glass-border bg-slate-900/95 backdrop-blur-3xl absolute w-full left-0 top-16 shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `block px-3 py-3 rounded-md text-base font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-300 hover:bg-slate-800'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="border-t border-glass-border mt-4 pt-4">
              <button 
                onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 text-red-400 font-medium hover:bg-slate-800 rounded-md"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

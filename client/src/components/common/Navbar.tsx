import React, { useState } from 'react';
import { Compass, Menu, X, ArrowRight, UserCheck, Terminal } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg-primary/80 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px] flex items-center justify-center shadow-lg shadow-accent-purple/20">
              <div className="w-full h-full bg-bg-card rounded-[11px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-accent-cyan" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-text-main via-slate-100 to-text-muted bg-clip-text text-transparent">
                CareerPath
              </span>
              <span className="ml-1.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-text-muted">
            <Link
              to="/career-research"
              className={`transition-colors ${
                isActive('/career-research') ? 'text-accent-cyan font-semibold' : 'hover:text-text-main'
              }`}
            >
              Role Benchmarks
            </Link>
            <Link
              to="/analysis"
              className={`transition-colors ${
                isActive('/analysis') ? 'text-accent-cyan font-semibold' : 'hover:text-text-main'
              }`}
            >
              Skill Gaps
            </Link>
            <Link
              to="/roadmap"
              className={`transition-colors ${
                isActive('/roadmap') ? 'text-accent-cyan font-semibold' : 'hover:text-text-main'
              }`}
            >
              Roadmap
            </Link>
            <Link
              to="/interview"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                isActive('/interview')
                  ? 'bg-accent-purple/20 border-accent-purple text-text-main'
                  : 'bg-bg-secondary/60 border-border-subtle hover:border-accent-purple/40 hover:text-text-main'
              }`}
            >
              <Terminal size={13} className="text-accent-cyan" />
              <span>Mock Interview</span>
            </Link>
          </nav>
          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                icon={<UserCheck size={15} />}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleOpenAuth('login')}>
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  onClick={() => handleOpenAuth('register')}
                >
                  Get Started
                </Button>
                
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-main"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border-subtle bg-bg-secondary p-6 space-y-4">
            <nav className="flex flex-col gap-3 text-sm font-medium text-text-muted">
              <Link
                to="/career-research"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-text-main py-1"
              >
                Role Benchmarks
              </Link>
              <Link
                to="/analysis"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-text-main py-1"
              >
                Skill Gaps
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-text-main py-1"
              >
                Roadmap
              </Link>
              <Link
                to="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 hover:text-text-main py-1 text-accent-cyan"
              >
                <Terminal size={15} />
                <span>Mock Interview</span>
              </Link>
            </nav>
            <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
              {user ? (
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-center" onClick={() => handleOpenAuth('login')}>
                    Sign In
                  </Button>
                  <Button variant="primary" className="w-full justify-center" onClick={() => handleOpenAuth('register')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};
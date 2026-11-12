import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const response = await api.post(endpoint, payload);

      login(response.data.data.token, response.data.data.user);
      onClose();
    } catch (err: any) {
      console.error('[Auth Error Full Object]:', err);
      console.error('[Server Response Data]:', err.response?.data);

      const serverMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response?.data?.errors[0]?.message) ||
        err.message;

      setError(serverMsg || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      login(response.data.data.token, response.data.data.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-bg-card border border-border-subtle rounded-2xl p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-dim hover:text-text-main transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-text-main">
            {isLogin ? 'Sign In to CareerPath' : 'Create an Account'}
          </h3>
          <p className="text-xs text-text-muted mt-1">
            {isLogin
              ? 'Access your saved career roadmaps and real-time skill insights.'
              : 'Start your dynamic, AI-powered career roadmap right away.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="flex flex-col items-center justify-center mb-5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-In was cancelled or failed.')}
            theme="filled_black"
            shape="circle"
            size="large"
            text={isLogin ? 'signin_with' : 'signup_with'}
            width="100%"
          />
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-border-subtle w-full" />
          <span className="bg-bg-card px-3 text-[11px] uppercase tracking-wider text-text-dim font-medium absolute">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Full Name</label>
              <div className="relative flex items-center">
                <UserIcon size={16} className="absolute left-3 text-text-dim" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-purple rounded-xl pl-9 pr-3 py-2.5 text-xs text-text-main placeholder-text-dim focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3 text-text-dim" />
              <input
                type="email"
                required
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-purple rounded-xl pl-9 pr-3 py-2.5 text-xs text-text-main placeholder-text-dim focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-text-dim" />
              <input
                type="password"
                required
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle focus:border-accent-purple rounded-xl pl-9 pr-3 py-2.5 text-xs text-text-main placeholder-text-dim focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full justify-center mt-2"
            icon={submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          >
            {submitting ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-text-muted">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-accent-cyan hover:underline font-semibold ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};
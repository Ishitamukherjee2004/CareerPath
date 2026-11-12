import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  LogIn,
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Compass,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

const POPULAR_ROLES = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'Cloud Security Engineer',
  'DevOps Engineer'
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Auth | Step 2: Resume Upload | Step 3: Learning Canvas
  const [step, setStep] = useState<number>(() => (localStorage.getItem('token') ? 2 : 1));
  const [isLoginMode, setIsLoginMode] = useState<boolean>(false);

  // Step 1: Auth State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Step 2: Resume State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Step 3: Learning Canvas State
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [knownTech, setKnownTech] = useState<string>('');
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // STEP 1 HANDLER: Authenticate & Store Token
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLoginMode && !name.trim())) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setAuthLoading(true);
      setErrorMsg(null);

      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const payload = isLoginMode ? { email, password } : { name, email, password };
      const res = await api.post(endpoint, payload);

      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user || { name: name || email.split('@')[0], email };

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (login) login(token, user);
      }

      if (isLoginMode) {
        navigate('/dashboard');
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // STEP 2 HANDLER: Resume Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setErrorMsg('Please upload a valid PDF file.');
        return;
      }
      setErrorMsg(null);
      setFile(selected);
    }
  };

  const handleUploadResume = async () => {
    if (!file) {
      setErrorMsg('Please select a PDF resume first, or click Skip.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', file);

      await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to parse resume PDF.');
    } finally {
      setUploading(false);
    }
  };

  // STEP 3 HANDLER: Save Target Career & Initialize Dashboard
  const handleCompleteCanvas = async () => {
    try {
      setSavingProfile(true);
      setErrorMsg(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('Session expired. Please sign in at Step 1.');
        setStep(1);
        return;
      }

      await api.put(
        '/auth/profile',
        {
          targetRole,
          knownTechnologies: knownTech
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          weeklyHours
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/dashboard');
    } catch (err: any) {
      // If profile endpoint route differs, still save locally and proceed to dashboard
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existingUser, targetRole }));
      navigate('/dashboard');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-bg-primary text-text-main">
      <div className="w-full max-w-2xl bg-bg-card border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* Step Pill & Progress Bars */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-mono mb-4">
            <Sparkles size={13} />
            <span>Profile Initialization • Step {step} of 3</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-12 bg-accent-purple'
                    : s < step
                    ? 'w-6 bg-emerald-400'
                    : 'w-6 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center flex items-center justify-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: ACCOUNT & AUTH ================= */}
        {step === 1 && (
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                {isLoginMode ? 'Welcome Back' : 'Create Your Candidate Profile'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                {isLoginMode
                  ? 'Sign in to access your readiness dashboard and roadmaps.'
                  : 'Register to save your parsed resume metrics and milestone progress.'}
              </p>
            </div>

            {!isLoginMode && (
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ishita Mukherjee"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-main text-sm focus:outline-none focus:border-accent-purple"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-main text-sm focus:outline-none focus:border-accent-purple"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-main text-sm focus:outline-none focus:border-accent-purple"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={authLoading}
              className="w-full mt-2"
              icon={
                authLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isLoginMode ? (
                  <LogIn size={16} />
                ) : (
                  <UserPlus size={16} />
                )
              }
            >
              {authLoading
                ? 'Authenticating...'
                : isLoginMode
                ? 'Sign In to Dashboard'
                : 'Continue to Resume Upload'}
            </Button>

            <p className="text-center text-xs text-text-muted pt-2">
              {isLoginMode ? "Don't have an account? " : 'Already registered? '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrorMsg(null);
                }}
                className="text-accent-cyan font-semibold hover:underline"
              >
                {isLoginMode ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </form>
        )}

        {/* ================= STEP 2: UPLOAD RESUME ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                Upload Your Engineering Resume
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Extracts verified tech stacks and project metrics for gap benchmarking.
              </p>
            </div>

            <label
              htmlFor="resume-pdf-dropzone"
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                file
                  ? 'border-emerald-500/50 bg-emerald-500/[0.04]'
                  : 'border-border-subtle hover:border-accent-purple/50 bg-bg-secondary/40'
              }`}
            >
              <input
                id="resume-pdf-dropzone"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="space-y-2 flex flex-col items-center">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                  <span className="text-sm font-bold text-text-main">{file.name}</span>
                  <span className="text-xs text-text-dim">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                  </span>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-main block">
                      Click to browse or drop your PDF resume
                    </span>
                    <span className="text-xs text-text-dim mt-1 block">PDF format only (Max 10MB)</span>
                  </div>
                </div>
              )}
            </label>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setErrorMsg(null);
                  setStep(3);
                }}
                disabled={uploading}
              >
                Skip Upload
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleUploadResume}
                disabled={uploading || !file}
                icon={uploading ? <Loader2 className="animate-spin" size={15} /> : <FileText size={15} />}
              >
                {uploading ? 'Parsing PDF...' : 'Parse & Continue'}
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONFIGURE LEARNING CANVAS ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                Configure Your Learning Canvas
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Tailors your roadmap pace, prerequisite skips, and milestone generation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bg-secondary/60 border border-border-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Compass size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Desired Career Objective</h3>
                  <p className="text-xs text-text-muted">
                    Enter any discipline. The AI engine will dynamically research market expectations.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Target Career Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-text-main text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {POPULAR_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      targetRole === role
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-main'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">
                  Initial Known Technologies (Optional — Comma separated)
                </label>
                <input
                  type="text"
                  value={knownTech}
                  onChange={(e) => setKnownTech(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, SQL"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-text-main text-sm focus:outline-none focus:border-accent-purple"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setErrorMsg(null);
                  setStep(2);
                }}
                icon={<ArrowLeft size={14} />}
              >
                Back to Resume
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleCompleteCanvas}
                disabled={savingProfile || !targetRole.trim()}
                icon={savingProfile ? <Loader2 className="animate-spin" size={15} /> : <ArrowRight size={15} />}
              >
                {savingProfile ? 'Initializing...' : 'Launch Dashboard'}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
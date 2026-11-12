import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, ShieldCheck, Zap, Sparkles, LogIn } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary text-text-main flex flex-col justify-between selection:bg-accent-purple/30">
      
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex-1 flex flex-col justify-center items-center">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-mono mb-8 animate-fade-in">
          <Sparkles size={14} className="text-accent-cyan" />
          <span>Production-Grade Career Readiness Pipeline</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Architect your engineering career with{' '}
          <span className="bg-gradient-to-r from-accent-purple via-accent-cyan to-emerald-400 bg-clip-text text-transparent">
            predictable certainty.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
          Close resume gaps, execute weekly milestone roadmaps, and clear conversational technical interviews with staff-level feedback.
        </p>

        {/* Primary Action Buttons: Get Started + Sign In */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/onboarding')}
            icon={<ArrowRight size={18} />}
            className="w-full sm:w-auto shadow-lg shadow-accent-purple/25"
          >
            Get Started Free
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/login')}
            icon={<LogIn size={18} />}
            className="w-full sm:w-auto border-border-subtle hover:border-accent-purple/40"
          >
            Sign In to Account
          </Button>
        </div>

        {/* Quick Log-In Prompt Underneath */}
        <p className="mt-5 text-xs text-text-dim">
          Existing candidate?{' '}
          <Link
            to="/login"
            className="text-accent-cyan hover:underline font-medium"
          >
            Sign in here &rarr;
          </Link>
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-4 text-accent-cyan">
              <Zap size={20} />
            </div>
            <h3 className="text-sm font-bold text-text-main mb-2">Automated Gap Analysis</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Parse PDFs and extract demonstrated engineering competencies against industry role frameworks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4 text-accent-purple">
              <Compass size={20} />
            </div>
            <h3 className="text-sm font-bold text-text-main mb-2">Adaptive Roadmaps</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Multi-week milestone timelines tailored to your actual hourly availability and portfolio targets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-text-main mb-2">Mock Technical Rounds</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Staff-level conversational drills evaluating technical depth, communication, and missed edge cases.
            </p>
          </div>
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-border-subtle py-6 text-center text-xs text-text-dim">
        <p>&copy; {new Date().getFullYear()} CareerPath AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
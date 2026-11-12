import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Send,
  Loader2,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Code2
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/common/Button';

interface Turn {
  _id: string;
  question: string;
  category: string;
  difficulty: string;
  userAnswer?: string;
  evaluation?: {
    score: number;
    technicalAccuracy: string;
    missingEdgeCases: string[];
    idealResponseSummary: string;
    evaluatedAt: string | null;
  };
}

interface Session {
  _id: string;
  targetRole: string;
  difficulty: string;
  averageScore: number;
  status: string;
  turns: Turn[];
}

export const MockInterview: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [difficulty, setDifficulty] = useState<string>('mid');
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [starting, setStarting] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const startNewSession = async () => {
    try {
      setStarting(true);
      const res = await api.post('/interviews/start', {
        targetRole,
        difficulty,
      });
      setSession(res.data.data.session);
      setCurrentAnswer('');
    } catch (err) {
      console.error('Failed to start session', err);
    } finally {
      setStarting(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!session || !currentAnswer.trim() || submitting) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/interview/${session._id}/submit`, {
        answer: currentAnswer,
      });
      setSession(res.data.data.session);
      setCurrentAnswer('');
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setSubmitting(false);
    }
  };

  // If no active session, show setup console
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center mx-auto mb-4 border border-accent-cyan/20">
          <Terminal size={28} />
        </div>
        <h1 className="text-3xl font-extrabold text-text-main">
          Live AI Technical Interviewer
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-lg mx-auto leading-relaxed">
          Practice scenario-based architectural questions, concurrency debugging, and runtime deep dives with instant, multi-dimensional feedback from a simulated Staff Engineer.
        </p>

        <div className="mt-8 p-6 rounded-2xl bg-bg-card border border-border-subtle max-w-md mx-auto space-y-4 text-left">
          <div>
            <label className="text-xs font-mono uppercase text-text-dim block mb-1">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer"
              className="w-full px-3.5 py-2 rounded-xl bg-bg-secondary border border-border-subtle text-text-main text-xs focus:outline-none focus:border-accent-purple"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-text-dim block mb-1">
              Seniority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['junior', 'mid', 'senior'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                    difficulty === level
                      ? 'bg-accent-purple/20 border-accent-purple text-white shadow-sm'
                      : 'bg-bg-secondary border-border-subtle text-text-muted hover:text-text-main'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full mt-4"
            disabled={starting}
            onClick={startNewSession}
            icon={starting ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />}
          >
            {starting ? 'Configuring Interviewer...' : 'Begin Mock Interview'}
          </Button>
        </div>
      </div>
    );
  }

  const activeTurn = session.turns[session.turns.length - 1];
  const isAwaitingAnswer = !activeTurn.evaluation?.evaluatedAt;
  const turnIndex = session.turns.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10 space-y-8">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <span className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
            {session.targetRole} &bull; {session.difficulty} level
          </span>
          <h2 className="text-2xl font-extrabold text-text-main mt-0.5">
            Technical Question {turnIndex} of 5
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-bg-secondary border border-border-subtle px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-mono text-text-dim uppercase block">Session Score</span>
            <span className="text-lg font-bold text-accent-purple">
              {session.averageScore}%
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={startNewSession}
            icon={<RefreshCw size={13} />}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase">
            {activeTurn.category.replace('_', ' ')}
          </span>
          <span className="text-xs text-text-dim flex items-center gap-1 font-mono">
            <Terminal size={13} /> Live Drill
          </span>
        </div>
        <p className="text-base sm:text-lg font-medium text-text-main leading-relaxed">
          {activeTurn.question}
        </p>
      </div>

      {/* Answer Form (if currently awaiting response) */}
      {isAwaitingAnswer ? (
        <div className="space-y-4">
          <label className="text-xs font-mono uppercase text-text-dim block">
            Your Architectural Solution or Technical Answer
          </label>
          <textarea
            rows={7}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Structure your answer clearly: mention trade-offs, edge cases, error handling, and the concrete mechanics of your solution..."
            className="w-full p-4 rounded-2xl bg-bg-secondary border border-border-subtle text-text-main text-sm font-sans focus:outline-none focus:border-accent-purple resize-none leading-relaxed"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              disabled={submitting || !currentAnswer.trim()}
              onClick={handleAnswerSubmit}
              icon={submitting ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            >
              {submitting ? 'Staff Engineer Grading...' : 'Submit Answer for Review'}
            </Button>
          </div>
        </div>
      ) : (
        /* Evaluation Feedback Card */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-accent-purple/30 space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-4">
              <span className="text-sm font-bold text-text-main flex items-center gap-2">
                <Award className="text-accent-purple" size={18} /> Staff Evaluation
              </span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-extrabold text-accent-cyan">
                  {activeTurn.evaluation?.score}
                </span>
                <span className="text-xs text-text-dim">/ 100</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase text-text-dim mb-1">
                Accuracy & Architectural Reasoning
              </h4>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {activeTurn.evaluation?.technicalAccuracy}
              </p>
            </div>

            {activeTurn.evaluation?.missingEdgeCases && activeTurn.evaluation.missingEdgeCases.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} /> Unaddressed Edge Cases & Traps
                </h4>
                <ul className="space-y-1.5">
                  {activeTurn.evaluation.missingEdgeCases.map((edge, idx) => (
                    <li key={idx} className="text-xs text-text-muted flex items-start gap-2">
                      <span className="text-amber-400 mt-1">&bull;</span>
                      <span>{edge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 rounded-xl bg-bg-secondary border border-border-subtle">
              <h4 className="text-xs font-mono uppercase text-accent-cyan flex items-center gap-1.5 mb-1.5">
                <Lightbulb size={14} /> Staff / Principal Solution Framing
              </h4>
              <p className="text-xs text-text-dim leading-relaxed">
                {activeTurn.evaluation?.idealResponseSummary}
              </p>
            </div>
          </div>

          {session.status !== 'completed' ? (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  // Re-renders view on latest turn
                  setSession({ ...session });
                }}
                icon={<ArrowRight size={15} />}
              >
                Next Question
              </Button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CheckCircle2 size={30} className="text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-text-main">Mock Interview Completed!</h3>
              <p className="text-xs text-text-muted mt-1">
                Final Session Score: <strong className="text-emerald-400">{session.averageScore}%</strong> across all technical domains.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MockInterview;
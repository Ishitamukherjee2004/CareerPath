import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  AlertTriangle,
  Flame,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  FileText,
  Download,
  Database
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/common/Button';

interface AnalyticsData {
  cri: number;
  targetRole: string;
  breakdown: {
    resumeReadiness: number;
    roadmapCompletion: number;
    interviewAptitude: number;
  };
  activeRoadmap: {
    totalWeeks: number;
    completionPercentage: number;
    totalTasks: number;
  } | null;
  topSkillGaps: string[];
  unaddressedTraps: string[];
  interviewSessionsCount: number;
}

interface AtsBullet {
  headline: string;
  bullet: string;
  highlightedKeywords: string[];
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [bullets, setBullets] = useState<AtsBullet[]>([]);
  const [generatingBullets, setGeneratingBullets] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/overview');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);


  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await api.post('/analytics/seed-demo');
      const res = await api.get('/analytics/overview');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to seed demo data', err);
    } finally {
      setSeeding(false);
    }
  };
  const handleGenerateBullets = async () => {
    try {
      setGeneratingBullets(true);
      const res = await api.post('/analytics/resume-bullets');
      setBullets(res.data.data.bullets);
    } catch (err) {
      console.error('Failed to generate bullets', err);
    } finally {
      setGeneratingBullets(false);
    }
  };

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accent-cyan" size={32} />
        <p className="text-xs text-text-dim">Aggregating career readiness metrics...</p>
      </div>
    );
  }

  const criScore = data?.cri || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-10">
      {/* Top Banner */}
      <div className="flex items-center gap-3 no-print">
          <div className="flex flex-wrap items-center gap-3 no-print">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeedDemo}
            disabled={seeding}
            icon={seeding ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
          >
            {seeding ? 'Populating...' : 'Seed Sample Data'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Download size={14} />}
          >
            Export PDF Dossier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interview')}
            icon={<Terminal size={14} />}
          >
            Practice Drill
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/roadmap')}
            icon={<ArrowRight size={14} />}
          >
            Active Roadmap
          </Button>
        </div>
          
        </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-subtle">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-mono mb-3">
            <Activity size={13} />
            <span>Target Pipeline: {data?.targetRole || 'Software Engineer'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Career Readiness Index
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl leading-relaxed">
            Your real-time hireability score computed across resume evidence, roadmap milestones, and technical interview evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interview')}
            icon={<Terminal size={14} />}
          >
            Practice Drill
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/roadmap')}
            icon={<ArrowRight size={14} />}
          >
            Active Roadmap
          </Button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Composite CRI Meter */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-bg-card to-bg-secondary border border-accent-purple/30 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-accent-purple block mb-1">
              Overall Hireability (CRI)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold text-text-main">{criScore}</span>
              <span className="text-sm font-mono text-text-dim">/ 100</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle/60 text-xs text-text-muted flex items-center gap-1.5">
            <TrendingUp className="text-accent-cyan" size={14} />
            <span>Composite readiness grade</span>
          </div>
        </div>

        {/* Resume Evidence */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-dim block mb-1">
              Resume Benchmark Match
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">
              {data?.breakdown.resumeReadiness || 0}%
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-text-dim">Verified skills</span>
            <span
              onClick={() => navigate('/analysis')}
              className="text-accent-cyan cursor-pointer hover:underline"
            >
              View gaps &rarr;
            </span>
          </div>
        </div>

        {/* Roadmap Execution */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-dim block mb-1">
              Roadmap Progress
            </span>
            <div className="text-3xl font-extrabold text-accent-cyan mt-2">
              {data?.breakdown.roadmapCompletion || 0}%
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-text-dim">{data?.activeRoadmap?.totalWeeks || 0} weeks total</span>
            <span
              onClick={() => navigate('/roadmap')}
              className="text-accent-cyan cursor-pointer hover:underline"
            >
              Milestones &rarr;
            </span>
          </div>
        </div>

        {/* Technical Mock Avg */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-dim block mb-1">
              Interview Aptitude
            </span>
            <div className="text-3xl font-extrabold text-accent-purple mt-2">
              {data?.breakdown.interviewAptitude || 0}%
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-text-dim">{data?.interviewSessionsCount || 0} sessions</span>
            <span
              onClick={() => navigate('/interview')}
              className="text-accent-purple cursor-pointer hover:underline"
            >
              Drill now &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core Gaps Remaining */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <Flame className="text-rose-400" size={16} />
              Highest Priority Missing Technologies
            </h3>
            <span className="text-xs text-text-dim font-mono">From Gap Analysis</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Hiring managers for {data?.targetRole} flag these missing keywords first during screening:
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {data?.topSkillGaps && data.topSkillGaps.length > 0 ? (
              data.topSkillGaps.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-400">All core benchmarks covered!</span>
            )}
          </div>
        </div>

        {/* Frequent Interview Traps */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={16} />
              Unaddressed Edge Cases in Drills
            </h3>
            <span className="text-xs text-text-dim font-mono">From Mock Interviews</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Architectural failure scenarios you missed during live mock evaluations:
          </p>

          <div className="space-y-2 pt-1">
            {data?.unaddressedTraps && data.unaddressedTraps.length > 0 ? (
              data.unaddressedTraps.map((trap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-xs text-text-muted flex items-start gap-2.5"
                >
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span>{trap}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-dim">
                Complete mock interviews to extract your recurring failure points.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ATS Resume Bullet Generator */}
      <div className="p-8 rounded-2xl bg-bg-card border border-accent-purple/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent-purple font-mono text-xs uppercase mb-1">
              <Sparkles size={14} />
              <span>Portfolio Impact Synthesizer</span>
            </div>
            <h2 className="text-xl font-bold text-text-main">
              Generate ATS-Optimized Resume Bullets
            </h2>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              Translate your verified roadmap projects into Google X-Y-Z formula bullets with quantifiable metrics.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleGenerateBullets}
            disabled={generatingBullets}
            icon={
              generatingBullets ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <FileText size={15} />
              )
            }
          >
            {generatingBullets ? 'Synthesizing Bullets...' : 'Synthesize Resume Bullets'}
          </Button>
        </div>

        {/* Generated Bullets List */}
        {bullets.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            {bullets.map((b, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-bg-secondary border border-border-subtle hover:border-slate-700 transition-all flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-accent-cyan font-semibold block">
                    {b.headline}
                  </span>
                  <p className="text-xs sm:text-sm text-text-main leading-relaxed">
                    {b.bullet}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {b.highlightedKeywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-primary text-text-dim border border-border-subtle"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyBullet(b.bullet, idx)}
                  className="p-2 text-text-dim hover:text-white rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                  title="Copy bullet"
                >
                  {copiedIndex === idx ? (
                    <Check className="text-emerald-400" size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
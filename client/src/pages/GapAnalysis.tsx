import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code2,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Terminal,
  ShieldCheck,
  Flame,
  FileText,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/common/Button';

interface GapReport {
  overallReadinessScore: number;
  summary: {
    verifiedStrengthsCount: number;
    reinforcementCount: number;
    missingGapsCount: number;
  };
  strengths: { name: string; competency: string; evidenceLevel: string }[];
  reinforcementNeeded: { name: string; competency: string; recommendation: string }[];
  missingGaps: { name: string; competency: string; importance: string; recommendedProject: string }[];
  competencyBreakdown: {
    name: string;
    category: string;
    importance: string;
    readinessPercentage: number;
    skills: {
      name: string;
      status: 'demonstrated' | 'mentioned' | 'missing';
      score: number;
    }[];
    recommendedProject?: {
      title: string;
      summary: string;
    };
  }[];
}

export const GapAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [hasResume, setHasResume] = useState<boolean>(true);
  const [report, setReport] = useState<GapReport | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analysis/gap');
        setTargetRole(res.data.data.targetRole);
        setHasResume(res.data.data.hasUploadedResume);
        setReport(res.data.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={30} className="animate-spin text-accent-cyan" />
        <p className="text-xs text-text-dim">Analyzing your resume against industry benchmarks...</p>
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center mx-auto mb-4 border border-accent-purple/20">
          <FileText size={26} />
        </div>
        <h2 className="text-xl font-bold text-text-main">No resume on file</h2>
        <p className="text-xs text-text-muted mt-2">
          Upload your resume to see which specific libraries, backend tools, and projects you need.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" size="md" onClick={() => navigate('/resume')} icon={<ArrowRight size={15} />}>
            Upload Resume
          </Button>
        </div>
      </div>
    );
  }

  // Extract unique projects to build
  const actionableProjects = report?.competencyBreakdown
    ?.filter((c) => c.recommendedProject && c.recommendedProject.title && c.readinessPercentage < 100)
    ?.map((c) => ({
      ...c.recommendedProject!,
      domain: c.name,
      missingSkills: c.skills.filter((s) => s.status !== 'demonstrated').map((s) => s.name),
    })) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-10">
      
      {/* 1. Header & Quick Human Summary */}
      <div className="pb-8 border-b border-border-subtle/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-mono mb-3">
            <Sparkles size={13} />
            <span>Target Role Evaluation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Gap Analysis for {targetRole}
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl leading-relaxed">
            Here is the realistic breakdown of your profile: what skills you can already defend in an interview, what technologies you still need to learn, and the exact projects that will prove them.
          </p>
        </div>

        {/* Readiness Meter Card */}
        <div className="bg-bg-secondary/90 border border-border-subtle p-5 rounded-2xl flex items-center gap-5 min-w-[260px]">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-dim block">Interview Readiness</span>
            <div className="text-3xl font-extrabold text-text-main mt-0.5">
              {report?.overallReadinessScore}%
            </div>
            <span className="text-[11px] text-text-dim">Based on verified project proof</span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-accent-cyan border-r-accent-purple flex items-center justify-center font-bold text-xs text-text-main">
            {report?.overallReadinessScore}%
          </div>
        </div>
      </div>

      {/* 2. Three Concrete Skill Columns (What you have vs what to learn) */}
      <div>
        <h2 className="text-lg font-bold text-text-main mb-2">1. Your Technology Breakdown</h2>
        <p className="text-xs text-text-muted mb-6">
          Hiring leads classify technical skillsets by evidence. Here is where your resume stands:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Missing Tech (Red / Critical) */}
          <div className="p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Flame size={15} /> Technologies to Learn
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {report?.summary.missingGapsCount || 0} Missing
                </span>
              </div>
              <p className="text-xs text-text-dim mb-4 leading-relaxed">
                These are mandatory for modern {targetRole} roles but not found anywhere on your resume.
              </p>

              <div className="flex flex-wrap gap-2">
                {report?.missingGaps?.map((gap, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-xl bg-bg-primary text-rose-200 border border-rose-500/30 flex items-center gap-1.5 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {gap.name}
                  </span>
                ))}
                {(!report?.missingGaps || report.missingGaps.length === 0) && (
                  <span className="text-xs text-text-dim">No missing core tools found!</span>
                )}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-rose-500/10 text-[11px] text-text-dim">
              Priority: Focus on these in your next build.
            </div>
          </div>

          {/* Mentioned Tech Needing Proof (Amber) */}
          <div className="p-6 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertCircle size={15} /> Needs Project Proof
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {report?.summary.reinforcementCount || 0} Listed
                </span>
              </div>
              <p className="text-xs text-text-dim mb-4 leading-relaxed">
                You listed these on your resume, but without an accompanying project or measurable impact bullets.
              </p>

              <div className="flex flex-wrap gap-2">
                {report?.reinforcementNeeded?.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-xl bg-bg-primary text-amber-200 border border-amber-500/30 flex items-center gap-1.5 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {item.name}
                  </span>
                ))}
                {(!report?.reinforcementNeeded || report.reinforcementNeeded.length === 0) && (
                  <span className="text-xs text-text-dim">All mentioned tools have project proof.</span>
                )}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-500/10 text-[11px] text-text-dim">
              Risk: Interviewers will press on these if no code is attached.
            </div>
          </div>

          {/* Verified Strengths (Green) */}
          <div className="p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={15} /> Verified Strengths
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {report?.summary.verifiedStrengthsCount || 0} Validated
                </span>
              </div>
              <p className="text-xs text-text-dim mb-4 leading-relaxed">
                Detected directly inside your project descriptions or work experience with context.
              </p>

              <div className="flex flex-wrap gap-2">
                {report?.strengths?.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-xl bg-bg-primary text-emerald-200 border border-emerald-500/30 flex items-center gap-1.5 font-medium"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-500/10 text-[11px] text-emerald-400/80">
              Ready for technical interview defense.
            </div>
          </div>

        </div>
      </div>

      {/* 3. Actionable Portfolio Projects to Build */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-text-main">2. What Projects Do You Need to Build?</h2>
          <span className="text-xs text-text-dim font-mono">Tailored to close multiple gaps simultaneously</span>
        </div>
        <p className="text-xs text-text-muted mb-6">
          Instead of building trivial tutorial clones (to-do lists, basic blogs), these systems demonstrate actual production competence to recruiters:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actionableProjects.map((proj, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-purple/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                    {proj.domain}
                  </span>
                  <span className="text-[11px] text-text-dim flex items-center gap-1">
                    <FolderGit2 size={13} className="text-accent-cyan" /> Portfolio Project
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-main mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mb-5">
                  {proj.summary}
                </p>

                {/* Missing Skills this project knocks out */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase text-text-dim block mb-2">
                    Gaps This Project Fixes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.missingSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-bg-secondary text-accent-cyan border border-border-subtle font-mono"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
                <span className="text-[11px] text-text-dim">Estimated build: 4 - 6 days</span>
                <span className="text-xs text-accent-purple font-medium flex items-center gap-1 hover:underline cursor-pointer">
                  Included in Roadmap <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Banner to Phase 8 */}
      <div className="p-7 rounded-2xl bg-gradient-to-r from-accent-purple/10 via-bg-card to-accent-cyan/10 border border-accent-purple/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-text-main">
            Generate Your Step-by-Step Adaptive Learning Roadmap
          </h3>
          <p className="text-xs text-text-muted mt-1 max-w-xl">
            We will turn these missing technologies and project builds into a structured weekly schedule matched to your exact study hours.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={<ArrowRight size={16} />}
          onClick={() => navigate('/roadmap')}
        >
          Generate My Roadmap
        </Button>
      </div>

    </div>
  );
};

export default GapAnalysis;
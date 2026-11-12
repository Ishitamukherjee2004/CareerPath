import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Database, 
  Server, 
  Cpu, 
  Search, 
  Loader2,
  FolderGit2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

interface SkillReq {
  name: string;
  level: string;
}

interface Competency {
  name: string;
  description: string;
  importance: string;
  category: string;
  skillsRequired: SkillReq[];
  recommendedProject?: {
    title: string;
    summary: string;
  };
}

interface Framework {
  displayTitle: string;
  overview: string;
  competencies: Competency[];
}

export const CareerResearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [careerQuery, setCareerQuery] = useState(user?.targetCareer || 'Full Stack Developer');
  const [framework, setFramework] = useState<Framework | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'foundational':
        return <Cpu size={18} className="text-accent-cyan" />;
      case 'core_technical':
        return <Server size={18} className="text-accent-purple" />;
      case 'tools_ecosystem':
        return <Layers size={18} className="text-emerald-400" />;
      default:
        return <Database size={18} className="text-indigo-400" />;
    }
  };

  const performResearch = async (roleToFetch: string) => {
    if (!roleToFetch.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/careers/research', {
        title: roleToFetch.trim(),
      });
      setFramework(response.data.data.framework);
    } catch (err: any) {
      setError('Could not pull role data. Please try searching again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultRole = user?.targetCareer?.trim() || 'Full Stack Developer';
    setCareerQuery(defaultRole);
    performResearch(defaultRole);
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-border-subtle/80 gap-6">
        <div>
          <span className="text-xs font-mono font-medium text-accent-cyan tracking-wide uppercase">
            Career Snapshot
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main mt-1.5">
            {framework?.displayTitle || careerQuery}
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl leading-relaxed">
            {framework?.overview ||
              'Here is the exact skill breakdown companies expect in today’s tech stacks, organized by priority.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-bg-secondary/90 border border-border-subtle p-1.5 rounded-xl shadow-inner w-full md:w-auto">
          <input
            type="text"
            value={careerQuery}
            onChange={(e) => setCareerQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performResearch(careerQuery)}
            placeholder="Search another role..."
            className="bg-transparent text-xs text-text-main px-3 py-1 focus:outline-none w-full md:w-56"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => performResearch(careerQuery)}
            disabled={loading}
            icon={loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          >
            Explore
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center gap-3">
          <Loader2 size={28} className="animate-spin text-accent-purple" />
          <p className="text-sm text-text-muted">Analyzing expectations for {careerQuery}...</p>
        </div>
      ) : framework ? (
        <div className="mt-8 space-y-8">
          {/* Competency Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {framework.competencies.map((comp, idx) => {
              const isMustHave = comp.importance === 'critical';

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border-subtle bg-bg-card/70 hover:border-slate-700/80 transition-all p-6 flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(comp.category)}
                        <span className="text-[11px] font-medium text-text-dim capitalize">
                          {comp.category?.replace('_', ' ') || 'Core'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                          isMustHave
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-accent-purple/10 text-purple-300 border-accent-purple/20'
                        }`}
                      >
                        {isMustHave ? 'High Priority' : 'Good to Have'}
                      </span>
                    </div>

                    {/* Competency Title & Description */}
                    <h3 className="text-base font-bold text-text-main mb-2">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-5">
                      {comp.description}
                    </p>

                    {/* Skills Pills */}
                    <div className="mb-6">
                      <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                        Key Technologies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.skillsRequired.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-xs px-2.5 py-1 rounded-lg bg-bg-secondary text-text-main border border-border-subtle/80"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Practical Project Section */}
                  {comp.recommendedProject?.title && (
                    <div className="pt-4 border-t border-border-subtle/60">
                      <div className="flex items-center gap-1.5 text-accent-cyan text-[11px] font-medium mb-1">
                        <FolderGit2 size={13} />
                        <span>Recommended Build</span>
                      </div>
                      <h4 className="text-xs font-semibold text-text-main">
                        {comp.recommendedProject.title}
                      </h4>
                      <p className="text-[11px] text-text-dim mt-0.5 leading-snug">
                        {comp.recommendedProject.summary}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Action Strip */}
          <div className="rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Ready to find your gaps?
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                We'll match your verified resume skills against these benchmarks to show what you should learn next.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={16} />}
              onClick={() => navigate('/analysis')}
            >
              Analyze My Skill Gaps
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CareerResearch;
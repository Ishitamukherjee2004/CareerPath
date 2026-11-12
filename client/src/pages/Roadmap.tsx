import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FolderGit2,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/common/Button';

interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedHours: number;
  resourceQuery: string;
  completed: boolean;
}

interface Milestone {
  _id: string;
  weekNumber: number;
  title: string;
  focusArea: string;
  weeklyGoal: string;
  tasks: Task[];
  deliverableProject?: {
    title: string;
    description: string;
    completed: boolean;
  };
}

interface RoadmapData {
  _id: string;
  targetRole: string;
  totalWeeks: number;
  commitmentHoursPerDay: number;
  completionPercentage: number;
  milestones: Milestone[];
}

export const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Data Scientist');


  const fetchActiveRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmaps/active');
      setRoadmap(res.data.data.roadmap);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

 const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/roadmaps/generate', {
        targetRole: selectedRole.trim(),
      });
      setRoadmap(res.data.data.roadmap);
      setActiveWeek(1);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!roadmap) return;
    try {
      setTogglingTaskId(taskId);
      const res = await api.patch(`/roadmaps/${roadmap._id}/tasks/${taskId}/toggle`);
      setRoadmap(res.data.data.roadmap);
    } catch (err) {
      console.error('Error toggling task:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accent-cyan" size={32} />
        <p className="text-xs text-text-dim">Loading your personalized roadmap...</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center mx-auto mb-4 border border-accent-purple/20">
          <Calendar size={26} />
        </div>
        <h2 className="text-2xl font-extrabold text-text-main">Ready to build your roadmap?</h2>
        <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
          We will synthesize your exact missing skills into a week-by-week technical schedule calibrated to your daily hours.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="primary"
            onClick={handleGenerateRoadmap}
            disabled={generating}
            icon={generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          >
            {generating ? 'Synthesizing Schedule...' : 'Generate My Roadmap'}
          </Button>
        </div>
      </div>
    );
  }

  const selectedMilestone = roadmap.milestones.find((m) => m.weekNumber === activeWeek) || roadmap.milestones[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
      {/* Header */}
      <div className="pb-8 border-b border-border-subtle/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-mono mb-3">
            <Calendar size={13} />
            <span>Phase 8: Adaptive Roadmap</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            {roadmap.targetRole} Roadmap
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl leading-relaxed">
            {roadmap.totalWeeks} weeks &bull; {roadmap.commitmentHoursPerDay} hrs/day commitment &bull; Structured to close your skill gaps with real GitHub deliverables.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-bg-secondary border border-border-subtle px-4 py-3 rounded-2xl text-right">
            <span className="text-[10px] font-mono uppercase text-text-dim block">Overall Progress</span>
            <div className="text-2xl font-extrabold text-accent-cyan">
              {roadmap.completionPercentage}%
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleGenerateRoadmap}
            disabled={generating}
            icon={generating ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {roadmap.milestones.map((m) => {
          const isSelected = activeWeek === m.weekNumber;
          const completedCount = m.tasks.filter((t) => t.completed).length;
          const isWeekDone = completedCount === m.tasks.length && m.tasks.length > 0;

          return (
            <button
              key={m.weekNumber}
              onClick={() => setActiveWeek(m.weekNumber)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-accent-purple/20 border-accent-purple text-white shadow-sm'
                  : 'bg-bg-card border-border-subtle text-text-muted hover:text-text-main hover:border-slate-700'
              }`}
            >
              <span>Week {m.weekNumber}</span>
              {isWeekDone && <CheckCircle2 className="text-emerald-400" size={13} />}
            </button>
          );
        })}
      </div>

      {/* Active Milestone Card */}
      {selectedMilestone && (
        <div className="space-y-6">
          {/* Week Focus Overview */}
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-accent-cyan uppercase tracking-wide">
                Focus Area: {selectedMilestone.focusArea}
              </span>
              <span className="text-xs text-text-dim flex items-center gap-1.5">
                <Clock size={13} /> ~{roadmap.commitmentHoursPerDay * 5} hours total
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-main">{selectedMilestone.title}</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
              {selectedMilestone.weeklyGoal}
            </p>
          </div>

          {/* Task Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider font-mono text-text-dim">
              Weekly Execution Tasks
            </h3>

            <div className="space-y-3">
              {selectedMilestone.tasks.map((task) => {
                const isToggling = togglingTaskId === task._id;

                return (
                  <div
                    key={task._id}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      task.completed
                        ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-text-muted'
                        : 'bg-bg-card/70 border-border-subtle hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task._id)}
                      disabled={isToggling}
                      className="mt-0.5 text-text-dim hover:text-accent-cyan transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="text-emerald-400" size={20} />
                      ) : (
                        <Circle className="text-text-dim hover:text-white" size={20} />
                      )}
                    </button>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold ${
                            task.completed ? 'line-through text-text-dim' : 'text-text-main'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span className="text-[10px] font-mono text-text-dim bg-bg-secondary px-2 py-0.5 rounded">
                          {task.estimatedHours} hrs
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {task.description}
                      </p>

                      {task.resourceQuery && (
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            task.resourceQuery
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-accent-cyan hover:underline mt-2.5 font-medium"
                        >
                          <span>Official Docs / Deep Dive</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Deliverable Project */}
          {selectedMilestone.deliverableProject?.title && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-purple/10 to-transparent border border-accent-purple/30 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent-purple/15 text-accent-purple flex-shrink-0">
                <FolderGit2 size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-accent-purple block mb-1">
                  Week {selectedMilestone.weekNumber} Milestone Deliverable
                </span>
                <h3 className="text-base font-bold text-text-main">{selectedMilestone.deliverableProject.title}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {selectedMilestone.deliverableProject.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Roadmap;
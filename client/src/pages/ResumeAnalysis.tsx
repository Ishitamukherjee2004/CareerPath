import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Plus, 
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface Skill {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool' | 'concept' | 'other';
  evidenceLevel: 'demonstrated' | 'mentioned' | 'self_reported';
  context?: string;
}

interface ParsedResume {
  _id: string;
  fileName: string;
  fileSize: number;
  parsedProfile: {
    summary: string;
    skills: Skill[];
    projects: any[];
  };
  status: string;
}

export const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeResume, setActiveResume] = useState<ParsedResume | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable skills state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'language' | 'framework' | 'database' | 'tool' | 'concept' | 'other'>('language');
  const [newSkillLevel, setNewSkillLevel] = useState<'demonstrated' | 'mentioned' | 'self_reported'>('mentioned');

  const fetchExistingResume = async () => {
    try {
      const response = await api.get('/resumes/active');
      if (response.data.data.resume) {
        setActiveResume(response.data.data.resume);
        setSkills(response.data.data.resume.parsedProfile.skills || []);
      }
    } catch (err: any) {
      console.error('Failed to load active resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingResume();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const created = response.data.data.resume;
      setActiveResume(created);
      setSkills(created.parsedProfile.skills || []);
      setSuccessMsg('Resume parsed successfully! Review the extracted skills below.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload and analyze PDF.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const item: Skill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      evidenceLevel: newSkillLevel,
      context: 'Added manually during resume audit',
    };
    setSkills([...skills, item]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEvidenceToggle = (index: number) => {
    const updated = [...skills];
    const current = updated[index].evidenceLevel;
    updated[index].evidenceLevel = current === 'demonstrated' ? 'mentioned' : 'demonstrated';
    setSkills(updated);
  };

  const handleSaveReview = async () => {
    if (!activeResume) return;
    setSaving(true);
    setError(null);

    try {
      await api.put(`/resumes/${activeResume._id}/review`, { skills });
      setSuccessMsg('Evidence verified! Moving to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save review changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-medium mb-3">
          <Sparkles size={14} className="text-accent-cyan" />
          <span>Phase 5: Evidence Parsing & Resume Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
          Resume & Skill Audit
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Upload your PDF resume. Our parser identifies verified technical skills and project-backed evidence.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card glow={!activeResume} className="p-6">
            <h3 className="text-sm font-bold text-text-main mb-2 flex items-center gap-2">
              <UploadCloud size={18} className="text-accent-cyan" />
              <span>Upload PDF Document</span>
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Accepted formats: Clean PDF resumes up to 5MB. Scanned image documents without text layers are rejected.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-subtle hover:border-accent-purple rounded-xl p-8 text-center cursor-pointer transition-all bg-bg-secondary/40 hover:bg-bg-secondary/80 flex flex-col items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <Loader2 size={32} className="animate-spin text-accent-purple" />
                  <span className="text-xs text-text-muted">Analyzing document & code evidence...</span>
                </>
              ) : (
                <>
                  <FileText size={32} className="text-accent-purple" />
                  <div>
                    <span className="text-xs font-semibold text-text-main block">Click or Drop PDF Here</span>
                    <span className="text-[11px] text-text-dim block mt-0.5">Maximum size: 5MB</span>
                  </div>
                </>
              )}
            </div>

            {activeResume && (
              <div className="mt-4 p-3 rounded-lg bg-bg-secondary/70 border border-border-subtle flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={16} className="text-accent-green shrink-0" />
                  <span className="truncate text-text-main font-medium">{activeResume.fileName}</span>
                </div>
                <span className="text-[10px] text-text-dim font-mono">
                  {(activeResume.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h4 className="text-xs font-mono uppercase text-accent-green mb-2 flex items-center gap-2">
              <ShieldCheck size={14} />
              <span>Evidence Standard</span>
            </h4>
            <div className="space-y-3 text-xs text-text-muted leading-relaxed">
              <div>
                <strong className="text-accent-green block">Demonstrated:</strong>
                Supported by explicit implementation in a shipped project, open source repo, or production environment.
              </div>
              <div>
                <strong className="text-accent-cyan block">Mentioned:</strong>
                Listed under self-reported skills or coursework without explicit code context in the document.
              </div>
            </div>
          </Card>
        </div>

        {/* Extracted Evidence Review Editor */}
        <div className="lg:col-span-2">
          <Card glow={true} className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
              <div>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <span>Extracted Technical Competencies</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple font-mono">
                    {skills.length} detected
                  </span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Review and adjust the extracted skills. Click any badge to toggle between <em>Demonstrated</em> and <em>Mentioned</em>.
                </p>
              </div>

              {activeResume && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveReview}
                  disabled={saving}
                  icon={saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                >
                  {saving ? 'Saving...' : 'Confirm & Proceed'}
                </Button>
              )}
            </div>

            {/* Manual Add Input */}
            <div className="mt-5 p-3.5 rounded-xl bg-bg-secondary/40 border border-border-subtle flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                placeholder="Add skill missed by parser (e.g. Docker, Redis)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="w-full sm:flex-1 bg-bg-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-main placeholder-text-dim focus:outline-none focus:border-accent-purple"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="bg-bg-secondary border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-main focus:outline-none"
              >
                <option value="language">Language</option>
                <option value="framework">Framework</option>
                <option value="database">Database</option>
                <option value="tool">Tool</option>
                <option value="concept">Concept</option>
              </select>
              <Button size="sm" variant="secondary" onClick={handleAddSkill} icon={<Plus size={14} />}>
                Add
              </Button>
            </div>

            {/* Skills List */}
            <div className="mt-6">
              {skills.length === 0 ? (
                <div className="py-12 text-center text-text-dim text-xs">
                  No resume parsed yet. Upload your PDF to inspect detected skills.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-bg-secondary/70 border border-border-subtle flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-text-main block truncate">
                          {skill.name}
                        </span>
                        <span className="text-[10px] text-text-dim uppercase tracking-wider block">
                          {skill.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEvidenceToggle(index)}
                          title="Click to toggle evidence level"
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            skill.evidenceLevel === 'demonstrated'
                              ? 'bg-accent-green/15 text-accent-green border-accent-green/30 hover:bg-accent-green/25'
                              : 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30 hover:bg-accent-cyan/25'
                          }`}
                        >
                          {skill.evidenceLevel === 'demonstrated' ? 'Demonstrated' : 'Mentioned'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="text-text-dim hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
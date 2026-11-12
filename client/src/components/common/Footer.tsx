import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary/60 relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center">
              <Compass className="w-4 h-4 text-accent-cyan" />
            </div>
            <span className="font-semibold text-text-main">CareerPath</span>
            <span className="text-xs text-text-dim">| Autonomous Career Preparation Engine</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Sparkles size={14} className="text-accent-purple" />
            <span>Built dynamically on live industry intelligence. No static hardcoded roadmaps.</span>
          </div>

          <p className="text-xs text-text-dim">
            &copy; {new Date().getFullYear()} CareerPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
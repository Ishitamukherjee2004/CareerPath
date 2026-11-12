import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`
        relative bg-bg-card/80 backdrop-blur-md border rounded-2xl p-6 transition-all duration-300
        ${glow ? 'border-accent-purple/40 shadow-xl shadow-accent-purple/10' : 'border-border-subtle hover:border-slate-700'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
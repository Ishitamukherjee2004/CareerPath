import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-accent-purple hover:bg-[#7c4def] text-white shadow-lg shadow-accent-purple/25 hover:shadow-accent-purple/40 border border-accent-purple/50 active:scale-[0.98]",
    secondary: "bg-bg-card hover:bg-bg-hover text-text-main border border-border-subtle hover:border-accent-purple/40 active:scale-[0.98]",
    outline: "bg-transparent text-text-main border border-border-subtle hover:border-accent-cyan/50 hover:bg-accent-cyan/5 active:scale-[0.98]",
    ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-white/5",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
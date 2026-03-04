import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'purple' | 'pink' | 'cyan' | 'none';
  onClick?: () => void;
}

export function Card({ children, className, glow = 'none', onClick }: CardProps) {
  const glowClasses = {
    purple: 'glow-purple border-purple-500/50',
    pink: 'glow-pink border-pink-500/50',
    cyan: 'glow-cyan border-cyan-500/50',
    none: 'border-white/10',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl border p-4',
        glowClasses[glow],
        onClick && 'cursor-pointer hover:scale-[1.01] transition-transform',
        className
      )}
    >
      {children}
    </div>
  );
}

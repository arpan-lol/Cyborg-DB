'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizes[size]}
      >
        {/* Outer hexagon - represents security/structure */}
        <path
          d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Inner document layers - represents documents */}
        <path
          d="M11 11H21V13H11V11Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M11 15H21V17H11V15Z"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M11 19H17V21H11V19Z"
          fill="currentColor"
          opacity="0.7"
        />
        {/* Center keyhole/lock element */}
        <circle
          cx="16"
          cy="14"
          r="2"
          fill="currentColor"
        />
        <path
          d="M15 16H17V20H15V16Z"
          fill="currentColor"
        />
      </svg>
      {showText && (
        <span className={cn('font-semibold tracking-tight', textSizes[size])}>
          Veil
        </span>
      )}
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-6 h-6', className)}
    >
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M11 11H21V13H11V11Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M11 15H21V17H11V15Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M11 19H17V21H11V19Z"
        fill="currentColor"
        opacity="0.7"
      />
      <circle
        cx="16"
        cy="14"
        r="2"
        fill="currentColor"
      />
      <path
        d="M15 16H17V20H15V16Z"
        fill="currentColor"
      />
    </svg>
  );
}


import React from 'react';

export function IntakeDockLogo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#0F172A" />
        <path
          d="M9 10.5C9 9.67 9.67 9 10.5 9H17.5L23 14.5V21.5C23 22.33 22.33 23 21.5 23H10.5C9.67 23 9 22.33 9 21.5V10.5Z"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M17 9V15H23" stroke="#14B8A6" strokeWidth="2" strokeLinejoin="round" />
        <path
          d="M13 18L15 20L19.5 15.5"
          stroke="#14B8A6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-bold tracking-tight text-slate-950 text-lg">IntakeDock</span>
    </span>
  );
}

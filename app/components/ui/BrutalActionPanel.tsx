import React from 'react';

interface Props {
  actions: React.ReactNode;
  className?: string;
}

export function BrutalActionPanel({ actions, className = "" }: Props) {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 bg-magenta-500 p-4 z-50 border-t-4 border-black
      md:relative md:bottom-auto md:left-auto md:right-auto md:w-full md:h-full md:border-t-0 md:border-l-4
      md:p-0
      ${className}
    `}>
      <div className="flex md:flex-col items-stretch justify-center h-full gap-4">
        {actions}
      </div>
    </div>
  );
}

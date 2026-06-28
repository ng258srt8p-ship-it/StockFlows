import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BrutalSection({ title, children, className = "" }: Props) {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="border-b-4 border-black mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">
          {title}
        </h2>
      </div>
      <div className="bg-black/10 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {children}
      </div>
    </section>
  );
}

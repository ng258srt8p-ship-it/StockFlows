import React from 'react';

interface NavItem {
  label: string;
  id: string;
  icon?: React.ReactNode;
}

interface Props {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
}

export function BrutalNav({ items, activeId, onNavigate, className = "" }: Props) {
  return (
    <nav className={`flex md:flex-col gap-4 ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`
            flex items-center justify-center px-6 py-3
            border-4 border-black font-black uppercase tracking-widest
            transition-all duration-75
            ${activeId === item.id
              ? 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
              : 'bg-black text-white hover:bg-gray-800'}
            md:justify-start md:px-8 md:py-4
          `}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

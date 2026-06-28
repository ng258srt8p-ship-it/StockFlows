import React from 'react';

interface Props {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function BrutalSettingsLayout({
  children,
  navigation,
  actions,
  className = ""
}: Props) {
  return (
    <div className={`brutalist-settings ${className}`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed left-0 top-0 h-full border-r-4 border-black bg-white">
        <div className="p-6">
          {navigation}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Desktop Actions Panel */}
      <div className="hidden md:block fixed right-0 top-0 w-80 h-full border-l-4 border-black bg-white">
        {actions}
      </div>

      {/* Mobile Fixed Bottom Action Panel */}
      <div className="fixed bottom-0 left-0 right-0 border-t-4 border-black bg-white p-4 md:hidden">
        {actions}
      </div>
    </div>
  );
}

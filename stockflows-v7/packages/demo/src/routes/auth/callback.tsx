import React from 'react';

const AuthCallback: React.FC = () => (
  <div className="min-h-[80vh] flex items-center justify-center p-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Completing sign-in...</h1>
      <p className="text-[var(--text-secondary)]">Redirecting to your dashboard</p>
      <div className="mt-6 w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  </div>
);

export default AuthCallback;

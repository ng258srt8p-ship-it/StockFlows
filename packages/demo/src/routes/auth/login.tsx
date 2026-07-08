import React, { useState } from 'react';
import { Card, Button } from '@stockflows/ui';

const AuthLogin: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">StockFlows Demo</h1>
        <p className="text-[var(--text-secondary)] text-center mb-8">Sign in to explore the full application</p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]"
          />
          <Button variant="primary" size="lg" fullWidth>
            Sign In with Demo Account
          </Button>
        </div>
        <p className="text-[var(--text-secondary)] text-center text-sm mt-6">Demo mode — no real authentication required</p>
      </Card>
    </div>
  );
};

export default AuthLogin;

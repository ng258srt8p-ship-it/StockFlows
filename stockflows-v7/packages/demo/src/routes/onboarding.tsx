import React, { useState } from 'react';
import { Card, Badge, Button } from '@stockflows/ui';

const steps = [
  { id: 1, title: 'Connect Your Shopify Store', description: 'Link your store to sync inventory in real-time', icon: 'link' },
  { id: 2, title: 'Import Inventory', description: 'Sync your existing products and stock levels', icon: 'inventory_2' },
  { id: 3, title: 'Configure Forecasting', description: 'Set reorder points and forecast models', icon: 'trending_up' },
  { id: 4, title: 'Add Vendors', description: 'Import vendor contacts and lead times', icon: 'store' },
  { id: 5, title: 'Enable Alerts', description: 'Configure stock alerts and notifications', icon: 'notifications_active' },
  { id: 6, title: 'Start Managing', description: 'You are ready to optimize your inventory!', icon: 'check_circle' },
];

const currentStep = 3;

const OnboardingFlow: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Getting Started</h1>

    <div className="space-y-6">
      {steps.map(step => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;

        return (
          <Card key={step.id} className={isCurrent ? 'ring-2 ring-[var(--accent)]' : ''}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : isCurrent ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--border)] text-[var(--text-secondary)]'}`}>
                {isCompleted ? '✓' : step.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-bold ${isCompleted || isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{step.title}</h3>
                  <Badge status={isCompleted ? 'success' : isCurrent ? 'info' : 'warning'}>
                    {isCompleted ? 'Done' : isCurrent ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
                <p className="text-[var(--text-secondary)]">{step.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>

    <div className="flex gap-4 mt-8">
      <Button variant="secondary" size="lg">Previous</Button>
      <Button variant="primary" size="lg" fullWidth>Continue Setup</Button>
    </div>
  </div>
);

export default OnboardingFlow;

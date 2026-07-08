import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const teamMembers = [
  { id: '1', name: 'Alice Johnson', role: 'admin', email: 'alice@stockflows.com', status: 'active' },
  { id: '2', name: 'Bob Smith', role: 'editor', email: 'bob@stockflows.com', status: 'active' },
  { id: '3', name: 'Carol White', role: 'viewer', email: 'carol@stockflows.com', status: 'inactive' },
  { id: '4', name: 'Dave Brown', role: 'editor', email: 'dave@stockflows.com', status: 'active' },
];

const TeamMembersPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Team Members</h1>

    <div className="grid gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Active Members</h2>
        <div className="space-y-4">
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
              <div>
                <p className="text-[var(--text-primary)] font-medium">{member.name}</p>
                <p className="text-[var(--text-secondary)] text-sm">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={member.role === 'admin' ? 'warning' : member.role === 'editor' ? 'info' : 'success'}>
                  {member.role}
                </Badge>
                <Badge status={member.status === 'active' ? 'success' : 'error'}>
                  {member.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Permissions Overview</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>Total Members:</span>
            <span className="text-[var(--text-primary)]">{teamMembers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Admins:</span>
            <span className="text-[var(--text-primary)]">1</span>
          </div>
          <div className="flex justify-between">
            <span>Editors:</span>
            <span className="text-[var(--text-primary)]">2</span>
          </div>
          <div className="flex justify-between">
            <span>Viewers:</span>
            <span className="text-[var(--text-primary)]">1</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default TeamMembersPage;

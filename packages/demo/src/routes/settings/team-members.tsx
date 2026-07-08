import React, { useState } from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

const TeamMembersPage: React.FC = () => {
  const { teamMembers, addTeamMember, removeTeamMember, updateTeamMemberRole } = useDemoStore();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  const handleAdd = () => {
    if (!newName || !newEmail) return;
    addTeamMember({ name: newName, email: newEmail, role: newRole, status: 'invited' });
    setNewName('');
    setNewEmail('');
    setNewRole('viewer');
  };

  const admins = teamMembers.filter((m) => m.role === 'admin').length;
  const editors = teamMembers.filter((m) => m.role === 'editor').length;
  const viewers = teamMembers.filter((m) => m.role === 'viewer').length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Team Members</h1>

      <div className="grid gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Active Members</h2>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                <div>
                  <p className="text-[var(--text-primary)] font-medium">{member.name}</p>
                  <p className="text-[var(--text-secondary)] text-sm">{member.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => updateTeamMemberRole(member.id, e.target.value as any)}
                    className="rounded-lg border px-2 py-1 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] border-[var(--border)]"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Badge status={member.status === 'active' ? 'success' : 'warning'}>{member.status}</Badge>
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add Team Member</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
                placeholder="Full name"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="rounded-lg border px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-[var(--accent)] text-[var(--bg-primary)]"
            >
              Add
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Permissions Overview</h2>
          <div className="space-y-3 text-[var(--text-secondary)]">
            <div className="flex justify-between"><span>Total Members:</span><span className="text-[var(--text-primary)]">{teamMembers.length}</span></div>
            <div className="flex justify-between"><span>Admins:</span><span className="text-[var(--text-primary)]">{admins}</span></div>
            <div className="flex justify-between"><span>Editors:</span><span className="text-[var(--text-primary)]">{editors}</span></div>
            <div className="flex justify-between"><span>Viewers:</span><span className="text-[var(--text-primary)]">{viewers}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamMembersPage;

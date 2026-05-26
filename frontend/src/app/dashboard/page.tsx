import React from 'react';
import EmptyState from '@/components/dashboard/EmptyState';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Assessments Dashboard</h1>
      </div>
      <EmptyState />
    </div>
  );
}

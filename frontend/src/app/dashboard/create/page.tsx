import React from 'react';
import AssignmentForm from '@/components/create/AssignmentForm';

export default function CreateAssignmentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create AI Assessment</h1>
        <p className="text-slate-500 mt-1">Configure your questionnaire criteria and let VedaAI construct the assessment.</p>
      </div>
      <AssignmentForm />
    </div>
  );
}

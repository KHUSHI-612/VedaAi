import React from 'react';
import QuestionPaper from '@/components/output/QuestionPaper';

interface AssignmentDetailsPageProps {
  params: {
    id: string;
  };
}

export default function AssignmentDetailsPage({ params }: AssignmentDetailsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Question Paper View</h1>
      </div>
      <QuestionPaper id={params.id} />
    </div>
  );
}

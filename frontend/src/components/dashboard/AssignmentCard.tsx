import React from 'react';
import Link from 'next/link';

interface AssignmentCardProps {
  assessment: {
    id: string;
    subject: string;
    classLevel: string;
    marks: number;
    difficulty: string;
    createdAt: string;
  };
}

export default function AssignmentCard({ assessment }: AssignmentCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 mb-2">
            Class {assessment.classLevel}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{assessment.subject}</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 capitalize">
          {assessment.difficulty}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
        <div>Marks: <span className="font-semibold text-slate-700 dark:text-slate-200">{assessment.marks}</span></div>
        <Link href={`/dashboard/assignments/${assessment.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
          View Paper &rarr;
        </Link>
      </div>
    </div>
  );
}

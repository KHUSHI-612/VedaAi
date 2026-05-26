import React from 'react';
import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-white dark:bg-slate-800">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        📄
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No assessments generated yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        Generate high-quality structured question papers using VedaAI for your classroom in seconds.
      </p>
      <Link href="/dashboard/create" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition">
        Create Your First Assessment
      </Link>
    </div>
  );
}

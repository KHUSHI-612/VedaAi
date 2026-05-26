import React from 'react';

export default function GeneratingLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-12 bg-white dark:bg-slate-800 border rounded-xl shadow-sm text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Generating Question Paper...</h3>
      <p className="text-sm text-slate-500 max-w-sm">
        VedaAI is building a structured exam paper. This might take 30-40 seconds to process. Please wait.
      </p>
    </div>
  );
}

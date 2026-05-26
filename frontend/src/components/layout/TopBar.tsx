import React from 'react';

export default function TopBar() {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      <div className="text-slate-600 dark:text-slate-300 font-medium">
        Welcome, Educator
      </div>
      <div className="flex items-center space-x-4">
        <span className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
          E
        </span>
      </div>
    </header>
  );
}

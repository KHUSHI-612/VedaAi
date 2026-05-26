import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <span className="text-xl font-bold tracking-wider">VedaAI Creator</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-700">
          Dashboard
        </Link>
        <Link href="/dashboard/create" className="block px-4 py-2 rounded hover:bg-slate-700">
          Create Assessment
        </Link>
      </nav>
    </aside>
  );
}

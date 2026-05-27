'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  Clock,
  Monitor,
} from 'lucide-react';

export default function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      href: '/dashboard/home',
      icon: LayoutGrid,
      isActive: pathname === '/dashboard/home',
    },
    {
      name: 'Assignments',
      href: '/dashboard',
      icon: FileText,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/assignments'),
    },
    {
      name: 'Library',
      href: '/dashboard/library',
      icon: Clock,
      isActive: pathname === '/dashboard/library',
    },
    {
      name: 'AI Toolkit',
      href: '/dashboard/toolkit',
      icon: Monitor,
      isActive: pathname === '/dashboard/toolkit',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-[#1a1a1a] rounded-full px-5 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.15)] z-40 border border-gray-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-1"
          >
            <Icon
              className={`w-5.5 h-5.5 transition-colors ${
                tab.isActive ? 'text-white fill-white/10' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-[10px] font-semibold tracking-wide transition-colors ${
                tab.isActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

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
      href: '/dashboard',
      icon: LayoutGrid,
      isActive: false,
    },
    {
      name: 'Assignments',
      href: '/dashboard',
      icon: FileText,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/assignments'),
    },
    {
      name: 'Library',
      href: '/dashboard',
      icon: Clock,
      isActive: false,
    },
    {
      name: 'AI Toolkit',
      href: '/dashboard',
      icon: Monitor,
      isActive: false,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-[#1a1a1a] rounded-[24px] px-6 py-3 flex items-center justify-between shadow-xl z-40 border border-[#333333]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-[2px] flex-1"
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

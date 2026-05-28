'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAssessmentStore } from '../../store/assessmentStore';
import {
  ArrowLeft,
  LayoutGrid,
  Bell,
  ChevronDown,
  Menu,
} from 'lucide-react';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, loadUserProfile } = useAssessmentStore();

  // Load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Dynamically resolve page title if not provided as a prop
  const getPageTitle = () => {
    if (title) return title;

    if (pathname === '/dashboard') return 'Assignment';
    if (pathname === '/dashboard/create') return 'Create Assignment';
    if (pathname === '/dashboard/settings') return 'Settings';
    if (pathname === '/dashboard/groups') return 'My Groups';
    if (pathname === '/dashboard/toolkit') return "AI Teacher's Toolkit";
    if (pathname === '/dashboard/library') return 'My Library';
    if (pathname.startsWith('/dashboard/assignments/')) return 'Assignment Detail';

    return 'Dashboard';
  };

  const displayName = userProfile?.name || 'John Doe';

  return (
    <>
      {/* 1. DESKTOP FLOATING TOPBAR (hidden on mobile) */}
      <header className="hidden md:flex items-center justify-between bg-white border border-gray-100 rounded-2xl h-14 mt-4 mr-4 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] z-20">

        {/* Left Side: Icon + Page Name */}
        <div className="flex items-center gap-3">
          {pathname !== '/dashboard/home' && (
            <button
              onClick={() => router.back()}
              className="w-9 h-9 bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-center mr-2 hover:bg-gray-50 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-[#1a1a1a] stroke-[2px]" />
            </button>
          )}

          <LayoutGrid className="w-[18px] h-[18px] text-[#9ca3af]" />

          <span className="text-[17px] font-medium text-[#9ca3af] font-sans tracking-tight">
            {getPageTitle()}
          </span>
        </div>

        {/* Right Side: Bell + Avatar Card */}
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <button className="relative p-1.5 text-gray-400 hover:text-gray-800 transition-colors">
            <Bell className="w-[20px] h-[20px]" />
            {/* Orange Dot Indicator */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5e3a] rounded-full border border-white" />
          </button>

          {/* User Profile Info Dropdown */}
          <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
            {/* User Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-orange-100 bg-orange-50 flex-shrink-0">
              <Image
                src="/Avatar.png"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </div>

            {/* User Name */}
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              {displayName}
            </span>

            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-y-[1px]" />
          </div>
        </div>
      </header>

      {/* 2. MOBILE TOPBAR (hidden on desktop) */}
      <header className="flex md:hidden items-center justify-between bg-white mx-4 mt-4 p-3.5 rounded-2xl border border-gray-100 shadow-md z-20 relative">

        {/* Left Side: VedaAI Mobile branding */}
        <div className="relative w-[110px] h-7 flex-shrink-0">
          <Image
            src="/mobilelogo.png"
            alt="VedaAI Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Right Side: Bell + Avatar + Burger menu */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-1 text-gray-400">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#ff5e3a] rounded-full" />
          </button>

          {/* User Avatar */}
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-orange-100 bg-orange-50">
            <Image
              src="/Avatar.png"
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>

          {/* Hamburger Menu Toggle */}
          <button className="p-1 text-gray-500 hover:text-gray-900 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>
    </>
  );
}

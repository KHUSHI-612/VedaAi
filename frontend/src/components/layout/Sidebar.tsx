'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../store/assessmentStore';
import {
  LayoutGrid,
  Users,
  FileText,
  Monitor,
  Clock,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, loadUserProfile } = useAssessmentStore();

  // Load user profile from localStorage on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const navLinks = [
    {
      name: 'Home',
      href: '/dashboard/home',
      icon: LayoutGrid,
      isActive: pathname === '/dashboard/home',
    },
    {
      name: 'My Groups',
      href: '/dashboard/groups',
      icon: Users,
      isActive: pathname === '/dashboard/groups',
    },
    {
      name: 'Assignments',
      href: '/dashboard',
      icon: FileText,
      // Assignments is the main page (/dashboard)
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/assignments'),
    },
    {
      name: "AI Teacher's Toolkit",
      href: '/dashboard/toolkit',
      icon: Monitor,
      isActive: pathname === '/dashboard/toolkit',
    },
    {
      name: 'My Library',
      href: '/dashboard/library',
      icon: Clock,
      isActive: pathname === '/dashboard/library',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-white fixed left-4 top-4 bottom-4 rounded-[28px] border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 z-30 transition-all duration-300">
      
      {/* Top Section: Logo */}
      <div className="flex items-center px-1">
        <div className="relative w-[190px] h-[52px] flex-shrink-0">
          <Image
            src="/logo2.png"
            alt="VedaAI Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      {/* Create Assignment Button */}
      <button
        onClick={() => router.push('/dashboard/create')}
        className="group relative mt-6 w-full bg-[#1a1a1a] hover:bg-black text-white py-3 px-5 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] border-2 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.18)] hover:shadow-[0_0_18px_rgba(249,115,22,0.35)]"
      >
        <Sparkles className="w-4 h-4 text-orange-400 group-hover:animate-pulse" />
        <span>Create Assignment</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5 mt-8 px-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                link.isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  link.isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'
                }`}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-gray-50">
        {/* Settings Link */}
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            pathname === '/dashboard/settings'
              ? 'bg-gray-100 text-gray-900 font-semibold'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings
            className={`w-5 h-5 ${
              pathname === '/dashboard/settings' ? 'text-gray-900' : 'text-gray-400'
            }`}
          />
          <span>Settings</span>
        </Link>

        {/* School Profile Card */}
        {userProfile ? (
          <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100/70 p-3 rounded-2xl border border-gray-100/50 transition-all duration-200">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-orange-100 border border-orange-200">
              <Image
                src="/Avatar.png"
                alt="School Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13.5px] font-bold text-gray-800 truncate leading-tight">
                {userProfile.schoolName}
              </span>
              <span className="text-[11.5px] text-gray-400 truncate mt-0.5 leading-none">
                {userProfile.city}
              </span>
            </div>
          </div>
        ) : (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 bg-gray-50 hover:bg-orange-50/50 border border-dashed border-gray-200 hover:border-orange-200 p-3 rounded-2xl transition-all duration-200 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-700 leading-tight">
                Setup Profile
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 leading-none">
                Configure your school
              </span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}

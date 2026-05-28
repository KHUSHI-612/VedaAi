'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../store/assessmentStore';
import {
  LayoutGrid,
  Presentation,
  FileText,
  Book,
  PieChart,
  Settings,
  User,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, loadUserProfile, assessments, fetchAll } = useAssessmentStore();

  // Load user profile and fetch assessment count on mount
  useEffect(() => {
    loadUserProfile();
    fetchAll();
  }, [loadUserProfile, fetchAll]);

  const navLinks = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: LayoutGrid,
      enabled: true,
      isActive: pathname === '/dashboard/home',
    },
    {
      name: 'My Groups',
      href: '#',
      icon: Presentation,
      enabled: false,
      isActive: false,
    },
    {
      name: 'Assignments',
      href: '/dashboard',
      icon: FileText,
      enabled: true,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/assignments'),
    },
    {
      name: "AI Teacher's Toolkit",
      href: '#',
      icon: Book,
      enabled: false,
      isActive: false,
    },
    {
      name: 'My Library',
      href: '#',
      icon: PieChart,
      enabled: false,
      isActive: false,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-white fixed left-4 top-4 bottom-4 rounded-[28px] border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] p-6 z-30 transition-all duration-300">
      
      {/* Top Section: Logo */}
      <div className="flex items-center -ml-1 mt-1 mb-2">
        <div className="relative w-[220px] h-[60px] flex-shrink-0">
          <Image
            src="/logo2.png"
            alt="VedaAI Logo"
            fill
            className="object-contain object-left scale-[1.05] origin-left"
            priority
          />
        </div>
      </div>

      {/* Create Assignment Button */}
      <button
        onClick={() => {
          if (!userProfile) {
            router.push('/dashboard?triggerProfile=true');
          } else {
            router.push('/dashboard/create');
          }
        }}
        className="relative mt-5 w-full flex items-center justify-center transition-transform duration-200 hover:scale-[1.05] active:scale-95"
      >
        <Image
          src="/createassigment illustration.png"
          alt="Create Assignment"
          width={280}
          height={80}
          className="w-full scale-[1.18] h-auto object-contain drop-shadow-[0_4px_16px_rgba(255,94,58,0.2)]"
        />
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5 mt-8 px-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isAssignments = link.name === 'Assignments';
          const baseClass = `flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-150`;

          if (!link.enabled) {
            // Unbuilt pages — non-clickable but solidly visible gray
            return (
              <span
                key={link.name}
                className={`${baseClass} text-gray-500 cursor-not-allowed select-none`}
              >
                <Icon className="w-5 h-5 text-gray-500 stroke-[2px]" />
                <span className="flex-1 tracking-tight">{link.name}</span>
              </span>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`${baseClass} ${
                link.isActive
                  ? 'bg-gray-100 text-[#1a1a1a] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a1a1a]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors stroke-[2px] ${
                  link.isActive ? 'text-[#1a1a1a]' : 'text-gray-500'
                }`}
              />
              <span className="flex-1 tracking-tight">{link.name}</span>
              {isAssignments && assessments.length > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-tight">
                  {assessments.length}
                </span>
              )}
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

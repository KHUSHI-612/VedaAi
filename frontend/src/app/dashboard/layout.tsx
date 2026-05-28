import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import BottomTabBar from '../../components/layout/BottomTabBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#e8e8e8] overflow-hidden">
      {/* Sidebar - desktop only */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 bg-transparent min-h-screen md:ml-[312px] ml-0 w-full relative flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 flex flex-col p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  )
}

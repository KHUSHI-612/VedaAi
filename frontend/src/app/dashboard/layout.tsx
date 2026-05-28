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
      <div style={{
        width: '280px',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 40
      }} className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#cecece] min-h-screen md:ml-[280px] ml-0 w-full relative flex flex-col overflow-hidden">
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

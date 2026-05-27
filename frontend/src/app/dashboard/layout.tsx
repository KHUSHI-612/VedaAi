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
    <div className="flex h-screen bg-[#f0f0f0]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden md:pl-[312px] transition-all duration-300">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}

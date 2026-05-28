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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
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
      <div style={{
        marginLeft: 'var(--sidebar-margin, 312px)',
        flex: 1,
        backgroundColor: '#f0f0f0',
        minHeight: '100vh'
      }} className="md:ml-[280px] ml-0">
        <TopBar />
        <main style={{ padding: '24px' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  )
}

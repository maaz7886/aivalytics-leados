// src/layout/AppLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { CommandPalette } from '../components/ui/CommandPalette';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('leados_sidebar_collapsed') === 'true';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('leados_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-[#1F1F1D]">
      {/* 1. Desktop Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 2. Main Work Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-white">
        {/* Header */}
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white pb-16 md:pb-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* 3. Mobile Bottom Tab Bar */}
      <MobileBottomBar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* 4. Global Command Palette Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}

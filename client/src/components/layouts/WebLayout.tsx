// src/components/layouts/WebLayout.tsx
import { useState, useEffect } from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';

export function WebLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Adjust widths here
  const collapsedWidth = 64; // Tailwind = w-16
  const expandedWidth = 200; // Tailwind ~ w-[200px]
  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Fixed sidebar */}
      <div
        className="fixed top-0 left-0 h-screen z-40 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main content shifted accordingly */}
      <div
        className="flex flex-1 flex-col transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

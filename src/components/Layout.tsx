import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto relative grid-bg transition-all duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-lg font-bold tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-bg">
              <Menu size={14} />
            </div>
            <span className="font-mono tracking-widest">NEXUS</span>
          </h1>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Timer, 
  Grid3X3, 
  Archive, 
  Settings,
  CheckSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: CheckSquare, label: 'タスクコア', path: '/' },
  { icon: Calendar, label: 'カレンダー', path: '/calendar' },
  { icon: Timer, label: '集中タイマー', path: '/focus' },
  { icon: Grid3X3, label: 'マトリックス', path: '/matrix' },
  { icon: Archive, label: 'アーカイブ', path: '/archive' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isOpenMobile, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpenMobile ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseMobile}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative border-r border-border h-screen flex flex-col bg-card/80 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <button 
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 bg-zinc-800 border border-border rounded-full p-1 text-zinc-400 hover:text-white z-50 shadow-lg"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={cn("p-6 border-b border-border transition-all", isCollapsed ? "px-4" : "px-6")}>
          <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-bg shrink-0">
              <LayoutDashboard size={20} />
            </div>
            {!isCollapsed && <span className="font-mono tracking-widest">NEXUS</span>}
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group whitespace-nowrap",
                isActive 
                  ? "bg-accent/10 text-accent border border-accent/20" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-transform duration-200 group-hover:scale-110 shrink-0",
                "group-[.active]:text-accent"
              )} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border overflow-hidden">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            title={isCollapsed ? "設定" : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group whitespace-nowrap",
              isActive 
                ? "bg-accent/10 text-accent border border-accent/20" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
            )}
          >
            <Settings size={18} className={cn(
              "transition-transform duration-200 group-hover:scale-110 shrink-0",
              "group-[.active]:text-accent"
            )} />
            {!isCollapsed && <span className="text-sm font-medium">設定</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
}

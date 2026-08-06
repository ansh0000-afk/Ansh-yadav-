import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Bot, CheckSquare, ShieldCheck, Settings, Lock, LayoutDashboard, Wand2, GraduationCap } from 'lucide-react';

export type NavViewMode = 'dashboard' | 'commerce' | 'chat' | 'tools' | 'personas' | 'tasks' | 'settings' | 'security';

interface BottomNavigationProps {
  activeView: any;
  onSelectView: (view: any) => void;
  activeSessionTitle?: string;
  isAppLockEnabled?: boolean;
  taskCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeView,
  onSelectView,
  isAppLockEnabled = false,
  taskCount = 0
}) => {
  const navItems: { id: NavViewMode; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'commerce', label: 'Commerce', icon: GraduationCap },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tools', label: 'Tools', icon: Wand2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: taskCount > 0 ? taskCount : undefined },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md md:hidden pointer-events-auto select-none">
      {/* Glassmorphic Container */}
      <nav className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 flex-1 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavPill"
                  className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-600/30 -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-900 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-bold mt-1 tracking-tight truncate max-w-[56px] ${
                isActive ? 'text-white font-extrabold' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

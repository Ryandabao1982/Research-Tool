import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Star,
  Users,
  Info,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../shared/utils';
import { motion } from 'framer-motion';
import { FolderTree } from '../organization/FolderTree';


const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My Notes', path: '/notes' },
  { icon: Star, label: 'Favorites', path: '/favorites' },
  { icon: Users, label: 'Collaborators', path: '/collaborators' },
  { icon: Info, label: 'Details', path: '/details' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Preferences', path: '/settings' },
  { icon: LogOut, label: 'Sign out', path: '/logout' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-surface-100 border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* User Profile Section */}
      <div className="p-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-3 rounded-3xl bg-surface-200 border border-white/10 hover:bg-surface-300 transition-colors cursor-pointer group shadow-xl shadow-black/20"
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-brand flex-shrink-0 relative">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-black text-white truncate tracking-tight uppercase">NoteMaster</h3>
            <p className="text-[9px] text-text-muted font-bold truncate tracking-widest uppercase">Pro Member</p>
          </div>
          <ChevronRight className="w-3 h-3 text-text-dim group-hover:text-text-secondary transition-colors" />
        </motion.div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-6 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-4 text-[9px] font-black text-text-dim uppercase tracking-[0.25em] mb-5">Workspace</p>
          <nav className="space-y-1.5">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group",
                    isActive
                      ? "text-white bg-surface-200 shadow-xl shadow-black/40 border border-white/10"
                      : "text-text-secondary hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 w-1 h-5 bg-brand-blue rounded-full shadow-glow-blue"
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-brand-blue" : "group-hover:text-white"
                  )} />
                  <span className="tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/5">
          <FolderTree />
        </div>
      </div>


      {/* Bottom Actions Section */}
      <div className="p-6 border-t border-white/5 space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-text-secondary hover:text-white hover:bg-white/[0.03] transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
            <span className="tracking-tight">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}


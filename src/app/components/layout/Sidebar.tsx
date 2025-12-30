import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Star, 
  Users, 
  Info, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { cn } from '../../../shared/utils';

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
    <aside className="w-64 h-screen bg-[#121212] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* User Profile */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">NoteMaster</h3>
            <p className="text-[10px] text-gray-400 truncate">support@notemaster.co</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {mainNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              location.pathname === item.path
                ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              location.pathname === item.path ? "text-blue-400" : "group-hover:text-white"
            )} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-6 border-t border-white/5 space-y-2">
        {bottomNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:text-white" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

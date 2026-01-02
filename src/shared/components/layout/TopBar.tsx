import React from 'react';
import { Search, Bell, Download, MessageSquare, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { RoleSwitcher } from '../../../features/roles/RoleSwitcher';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({ title, onMenuClick, showMenuButton }: TopBarProps) {
  return (
    <header className="h-24 flex items-center justify-between px-6 md:px-10 bg-white border-b border-neutral-200 relative z-20">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 2xl:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-sans font-black text-neutral-900 leading-none mb-1">{title}</h1>
          <p className="font-mono text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Workspace / Dashboard</p>
        </div>
      </div>

      <div className="hidden xl:flex justify-center flex-1">
        <RoleSwitcher />
      </div>

      <div className="flex-1 max-w-xl px-4 lg:px-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary transition-all" />
          <input
            type="text"
            placeholder="Search notes, tags, or insights..."
            className="w-full bg-white border border-neutral-200 py-3.5 pl-12 pr-6 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-neutral-50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <kbd className="px-1.5 py-0.5 border rounded-none bg-neutral-50 border-neutral-200 text-[10px] font-mono font-bold text-neutral-600">⌘</kbd>
            <kbd className="px-1.5 py-0.5 border rounded-none bg-neutral-50 border-neutral-200 text-[10px] font-mono font-bold text-neutral-600">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden sm:flex items-center gap-2 pr-4 md:pr-6 border-r border-neutral-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 md:p-3 border rounded-none bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all relative group"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 bg-primary border-2 border-white" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 md:p-3 border rounded-none bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 md:p-3 border rounded-none bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pl-2">
          <div className="text-right hidden lg:block">
            <p className="font-sans text-[10px] font-black text-neutral-900 leading-none mb-0.5">Felix Wong</p>
            <p className="font-mono text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Administrator</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 border border-neutral-200 bg-neutral-50 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover" alt="User avatar" />
          </div>
        </div>
      </div>
    </header>
  );
}
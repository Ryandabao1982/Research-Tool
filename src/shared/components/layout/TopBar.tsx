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
    <header className="h-24 flex items-center justify-between px-6 md:px-10 bg-transparent relative z-20">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-text-secondary hover:text-white 2xl:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1">{title}</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Workspace / Dashboard</p>
        </div>
      </div>

      <div className="hidden xl:flex justify-center flex-1">
        <RoleSwitcher />
      </div>

      <div className="flex-1 max-w-xl px-4 lg:px-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-all" />
          <input
            type="text"
            placeholder="Search notes, tags, or insights..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/[0.05] focus:border-white/10 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-black text-gray-500">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-black text-gray-500">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden sm:flex items-center gap-2 pr-4 md:pr-6 border-r border-white/5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 md:p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all relative group shadow-lg"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-background shadow-sm shadow-blue-500/50" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 md:p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 md:p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pl-2">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black text-white leading-none mb-0.5">Felix Wong</p>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Administrator</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-brand-blue p-px shadow-xl shadow-brand-blue/20">
            <div className="w-full h-full rounded-[15px] bg-background flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover" alt="User avatar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
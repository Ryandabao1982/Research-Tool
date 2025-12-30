import React from 'react';
import { Search, Bell, Download, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-24 flex items-center justify-between px-10 bg-transparent relative z-20">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{title}</h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Workspace / Dashboard</p>
      </div>

      <div className="flex-1 max-w-2xl px-16">
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

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 pr-6 border-r border-white/5">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all relative group shadow-lg"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0f0f0f] shadow-sm shadow-blue-500/50" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-3 pl-2">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white leading-none mb-0.5">Felix Wong</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Administrator</p>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-brand-blue p-px shadow-xl shadow-brand-blue/20">
              <div className="w-full h-full rounded-[15px] bg-[#0f0f0f] flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover" alt="User avatar" />
              </div>
           </div>
        </div>
      </div>
    </header>
  );
}


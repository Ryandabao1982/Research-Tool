import React from 'react';
import { Search, Bell, Download, MessageSquare } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent">
      <h1 className="text-3xl font-bold text-white">{title}</h1>

      <div className="flex-1 max-w-xl px-12">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-[#1e1e1e] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0f0f0f]" />
        </button>
        <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <Download className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

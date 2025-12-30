import React, { useState, useEffect } from 'react';
import { useSelectionStore } from '../../../shared/hooks/useSelectionStore';
import { Sparkles, Save, Loader2, X, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../shared/utils';

interface SynthesisPanelProps {
  onSynthesize?: () => Promise<string | void>;
  onSave?: (content: string) => void;
  initialResult?: string;
}

export function SynthesisPanel({ onSynthesize, onSave, initialResult = '' }: SynthesisPanelProps) {
  const { selectedNoteIds, clearSelection } = useSelectionStore();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState(initialResult);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
    }
  }, [initialResult]);

  if (selectedNoteIds.length === 0) {
    return null;
  }

  const handleSynthesize = async () => {
    if (!onSynthesize) return;
    
    setIsSynthesizing(true);
    setResult('');
    try {
      const response = await onSynthesize();
      if (typeof response === 'string') {
        setResult(response);
      }
    } catch (error) {
      console.error('Synthesis failed:', error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSave = () => {
    if (onSave && result) {
      onSave(result);
      setResult('');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        clearSelection();
      }, 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-10 right-10 w-[440px] bg-[#1a1a1a] backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-[3rem] p-8 z-50 flex flex-col max-h-[85vh] overflow-hidden group/panel"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none group-hover/panel:bg-brand-blue/15 transition-colors duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-light/10 rounded-full blur-[100px] pointer-events-none group-hover/panel:bg-brand-light/15 transition-colors duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center border border-brand-blue/20 shadow-glow-blue">
              <Sparkles className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="font-black text-white text-xl tracking-tight leading-none mb-1">AI Synthesis</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-blue">Grounded Insight</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <span className="text-[10px] font-black text-white/80">
                {selectedNoteIds.length} {selectedNoteIds.length === 1 ? 'SOURCE' : 'SOURCES'}
              </span>
            </div>
            <button 
              onClick={clearSelection}
              className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-black text-xl tracking-tight">Saved Successfully</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Added to your workspace</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {!result && !isSynthesizing && (
                <p className="text-gray-400 text-sm leading-relaxed font-medium px-1">
                  Connect knowledge fragments. This engine uses <span className="text-brand-blue">RAG (Retrieval Augmented Generation)</span> to derive insights strictly from your selected notes.
                </p>
              )}

              {isSynthesizing && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-t-2 border-r-2 border-brand-blue rounded-full"
                    />
                    <Sparkles className="w-6 h-6 text-brand-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black text-lg tracking-tight">Analyzing Intelligence</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Constructing grounded response...</p>
                  </div>
                </div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 overflow-y-auto max-h-[45vh] custom-scrollbar rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-inner relative"
                >
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {result}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-4">
                {!result ? (
                  <button
                    onClick={handleSynthesize}
                    disabled={isSynthesizing}
                    className="w-full py-5 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-30 disabled:grayscale text-white text-sm font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-4 active:scale-95 group/btn"
                  >
                    {isSynthesizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />}
                    <span className="tracking-tight uppercase">Generate Synthesis</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setResult('')}
                      className="flex-1 py-5 bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 hover:text-white text-sm font-black rounded-2xl border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="tracking-tight uppercase">Discard</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-[2] py-5 bg-white text-[#1a1a1a] hover:bg-gray-100 text-sm font-black rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Save className="w-5 h-5" />
                      <span className="tracking-tight uppercase">Capture Insight</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


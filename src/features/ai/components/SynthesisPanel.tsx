import React, { useState, useEffect } from 'react';
import { useSelectionStore } from '../../../shared/hooks/useSelectionStore';
import { Sparkles, Save, Loader2, X, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      className="fixed bottom-8 right-8 w-[420px] bg-slate-900/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-6 z-50 flex flex-col max-h-[85vh] overflow-hidden"
    >
      {/* Accent Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg tracking-tight">AI Synthesis</h2>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Source-Grounded</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 bg-white/5 text-white/70 border border-white/10 rounded-full backdrop-blur-md">
              {selectedNoteIds.length} {selectedNoteIds.length === 1 ? 'note' : 'notes'}
            </span>
            <button 
              onClick={clearSelection}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white border border-transparent hover:border-white/10"
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
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-medium text-lg">Saved to notes!</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {!result && !isSynthesizing && (
                <p className="text-slate-400 text-sm leading-relaxed">
                  Synthesize insights from your selected documents. The response will be strictly restricted to the content of your local notes.
                </p>
              )}

              {isSynthesizing && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <Sparkles className="w-5 h-5 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold mb-1">Analyzing knowledge base...</p>
                    <p className="text-slate-500 text-xs italic">Constructing grounded response</p>
                  </div>
                </div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 overflow-y-auto max-h-[40vh] custom-scrollbar rounded-3xl border border-white/5 bg-white/[0.02] p-5 shadow-inner"
                >
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {result}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                {!result ? (
                  <button
                    onClick={handleSynthesize}
                    disabled={isSynthesizing}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isSynthesizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Generate Synthesis
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setResult('')}
                      className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-bold rounded-2xl border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-[2] py-4 px-6 bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save as Note
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

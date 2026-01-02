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
      className="fixed bottom-10 right-10 w-[440px] bg-white border border-neutral-200 p-8 z-50 flex flex-col max-h-[85vh] overflow-hidden group/panel"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none group-hover/panel:bg-primary/15 transition-colors duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neutral-200/50 blur-[100px] pointer-events-none group-hover/panel:bg-neutral-200/80 transition-colors duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-sans font-black text-neutral-900 text-xl leading-none mb-1">AI Synthesis</h2>
              <p className="font-mono text-[9px] font-black uppercase tracking-wider text-primary">Grounded Insight</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="p-2 border rounded-none hover:bg-neutral-50 text-neutral-600 transition-colors border-neutral-200"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Info */}
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-none">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Selected Notes</span>
            <span className="font-mono text-xs font-bold text-primary">{selectedNoteIds.length}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span>Ready for synthesis</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className={cn(
              "rg-btn rg-btn-primary flex-1 flex items-center justify-center gap-2",
              isSynthesizing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSave}
            disabled={!result}
            className={cn(
              "rg-btn rg-btn-secondary flex-1 flex items-center justify-center gap-2",
              !result && "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-none max-h-64 overflow-y-auto">
                <p className="font-sans text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
                  {result}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-primary/10 border border-primary/20 rounded-none text-center"
            >
              <span className="font-sans text-sm font-bold text-primary">✓ Saved successfully</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
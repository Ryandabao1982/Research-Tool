import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedback: any) => void;
}

export function FeedbackModal({ isOpen, onClose, onSave }: FeedbackModalProps) {
  const [satisfaction, setSatisfaction] = useState(5);
  const [easyAccess, setEasyAccess] = useState<boolean | null>(null);

  const handleSave = () => {
    onSave({ satisfaction, easyAccess });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-surface-100/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-glass pointer-events-auto overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-10 pb-6 relative">
                {/* Decorative Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-4xl font-bold text-white tracking-tight font-display">
                    Second Brain Insights
                  </h2>
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-[140px,1fr] gap-x-8 gap-y-6 mb-10">
                  <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.25em]">Neural Link</span>
                  <p className="text-sm text-text-secondary font-medium italic">Synchronizing your cognitive feedback loops.</p>
                  
                  <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.25em]">Session Data</span>
                  <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Active Consciousness</p>
                </div>

                <div className="h-px bg-white/5 w-full mb-10" />

                {/* Questions */}
                <div className="space-y-12">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.25em]">Cognitive Flow</span>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      How frictionless is your current organizational flow?
                    </p>
                    
                    {/* Range Slider */}
                    <div className="pt-6 pb-2 px-2">
                      <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-brand-blue shadow-[0_0_15px_rgba(0,112,243,0.5)] transition-all duration-300" 
                          style={{ 
                            width: `${(satisfaction - 1) * 11.11}%`,
                            backgroundColor: 'var(--brand-primary)' 
                          }} 
                        />
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={satisfaction}
                          onChange={(e) => setSatisfaction(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
                      <div className="flex justify-between mt-4 text-[10px] font-black text-text-dim tracking-widest">
                        <span>ENTROPY</span>
                        <span className="text-white bg-brand-blue/20 px-2 py-0.5 rounded-md" style={{ color: 'var(--brand-primary)' }}>{satisfaction}</span>
                        <span>HARMONY</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm text-white font-medium">
                      Is your Second Brain surfaceing insights naturally?
                    </p>
                    
                    <div className="flex gap-4">
                      {[
                        { label: 'Yes', value: true },
                        { label: 'No', value: false }
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setEasyAccess(opt.value)}
                          className={cn(
                            "flex-1 py-6 rounded-3xl text-sm font-bold transition-all duration-300 border",
                            easyAccess === opt.value 
                              ? "bg-white text-black shadow-xl scale-[1.02] border-white" 
                              : "bg-surface-200/40 text-text-secondary border-white/5 hover:border-white/20 hover:bg-surface-200/60"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-10 pt-4 flex justify-center">
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-glow-blue active:scale-95"
                  style={{ boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)' }}
                >
                  Commit to Memory
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

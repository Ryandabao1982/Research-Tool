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
            className="fixed inset-0 bg-neutral-950/80 z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white border border-neutral-200 pointer-events-auto overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-10 pb-6 relative">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-4xl font-sans font-bold text-neutral-900 tracking-tight">
                    Second Brain Insights
                  </h2>
                  <button 
                    onClick={onClose}
                    className="p-2 border rounded-none hover:bg-neutral-50 text-neutral-600 transition-colors border-neutral-200"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-[140px,1fr] gap-x-8 gap-y-6 mb-10">
                  <span className="font-mono text-[10px] font-black text-neutral-500 uppercase tracking-widest">Neural Link</span>
                  <p className="font-sans text-sm text-neutral-700 font-medium italic">Synchronizing your cognitive feedback loops.</p>
                  
                  <span className="font-mono text-[10px] font-black text-neutral-500 uppercase tracking-widest">Session Data</span>
                  <p className="font-sans text-sm text-neutral-700 font-medium uppercase tracking-wider">Active Consciousness</p>
                </div>

                <div className="h-px bg-neutral-200 w-full mb-10" />

                {/* Questions */}
                <div className="space-y-12">
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] font-black text-neutral-500 uppercase tracking-widest">Cognitive Flow</span>
                    <p className="font-sans text-sm text-neutral-900 font-medium leading-relaxed">
                      How frictionless is your current organizational flow?
                    </p>
                    
                    {/* Range Slider */}
                    <div className="pt-6 pb-2 px-2">
                      <div className="relative h-1.5 bg-neutral-200 border border-neutral-300 overflow-hidden">
                        <div 
                          className="absolute h-full bg-primary transition-all duration-300" 
                          style={{ 
                            width: `${(satisfaction - 1) * 11.11}%`
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
                      <div className="flex justify-between mt-4 font-mono text-[10px] font-black text-neutral-500 tracking-widest">
                        <span>ENTROPY</span>
                        <span className="text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5">{satisfaction}</span>
                        <span>HARMONY</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="font-sans text-sm text-neutral-900 font-medium">
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
                            "rg-btn flex-1 py-6 text-sm font-bold",
                            easyAccess === opt.value 
                              ? "rg-btn-primary" 
                              : "rg-btn-secondary"
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
                  className="rg-btn rg-btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest"
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
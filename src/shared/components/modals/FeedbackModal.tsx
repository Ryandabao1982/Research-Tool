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
              className="w-full max-w-2xl bg-[#2a2a2a] rounded-[3rem] border border-white/10 shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-10 pb-6">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-4xl font-bold text-white tracking-tight">
                    NoteMaster Productivity Insights
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
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Note Management</span>
                  <p className="text-sm text-gray-300 font-medium">This survey assesses your note-taking efficiency.</p>
                  
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">User Feedback</span>
                  <p className="text-sm text-gray-300 font-medium">All users</p>
                </div>

                <div className="h-px bg-white/5 w-full mb-10" />

                {/* Questions */}
                <div className="space-y-12">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Questions</span>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      Q1: On a scale of 1 to 10, how satisfied are you with organizing your notes? What challenges do you face?
                    </p>
                    
                    {/* Range Slider */}
                    <div className="pt-6 pb-2 px-2">
                      <div className="relative h-1 bg-white/10 rounded-full">
                        <div 
                          className="absolute h-full bg-[#bd00ff] rounded-full" 
                          style={{ width: `${(satisfaction - 1) * 11.11}%` }} 
                        />
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={satisfaction}
                          onChange={(e) => setSatisfaction(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-[#bd00ff] rounded-full shadow-lg pointer-events-none transition-all"
                          style={{ left: `${(satisfaction - 1) * 11.11}%`, transform: 'translate(-50%, -50%)' }}
                        />
                      </div>
                      <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm text-white font-medium">
                      Q2: Do you find it easy to access your favorite notes?
                    </p>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => setEasyAccess(true)}
                        className={cn(
                          "flex-1 aspect-[1.2/1] rounded-[2rem] text-sm font-bold transition-all",
                          easyAccess === true 
                            ? "bg-white text-[#1a1a1a] shadow-xl scale-105" 
                            : "bg-white/5 text-white border border-white/5 hover:bg-white/10"
                        )}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setEasyAccess(false)}
                        className={cn(
                          "flex-1 aspect-[1.2/1] rounded-[2rem] text-sm font-bold transition-all",
                          easyAccess === false 
                            ? "bg-[#bd00ff] text-white shadow-xl scale-105 shadow-[#bd00ff]/20" 
                            : "bg-white/5 text-white border border-white/5 hover:bg-white/10"
                        )}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-10 pt-4 flex justify-center">
                <button
                  onClick={handleSave}
                  className="w-full max-w-xs py-4 bg-white text-[#1a1a1a] rounded-full text-sm font-bold hover:bg-gray-100 transition-all shadow-xl"
                >
                  Save feedback
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

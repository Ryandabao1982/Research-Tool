import React from 'react';
import { useSelectionStore } from '../../../shared/hooks/useSelectionStore';
import { Sparkles } from 'lucide-react';

interface SynthesisPanelProps {
  onSynthesize?: () => void;
}

export function SynthesisPanel({ onSynthesize }: SynthesisPanelProps) {
  const { selectedNoteIds } = useSelectionStore();

  if (selectedNoteIds.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white/90 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-blue-900">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-sm">AI Synthesis</span>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {selectedNoteIds.length} notes selected
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Synthesize insights from your selected notes.
      </p>

      <button
        onClick={onSynthesize}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Synthesize
      </button>
    </div>
  );
}

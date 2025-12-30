import React, { useState, useEffect } from 'react';
import { useSelectionStore } from '../../../shared/hooks/useSelectionStore';
import { Sparkles, Save, Loader2, X } from 'lucide-react';

interface SynthesisPanelProps {
  onSynthesize?: () => Promise<string | void>;
  onSave?: (content: string) => void;
  initialResult?: string;
}

export function SynthesisPanel({ onSynthesize, onSave, initialResult = '' }: SynthesisPanelProps) {
  const { selectedNoteIds, clearSelection } = useSelectionStore();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState(initialResult);

  // Update result if initialResult prop changes (useful for testing)
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
      clearSelection();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-900">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-base">AI Synthesis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
            {selectedNoteIds.length} source{selectedNoteIds.length !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={clearSelection}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!result && !isSynthesizing && (
        <p className="text-sm text-gray-600 mb-6">
          Synthesize insights from your selected notes. The AI will strictly use the content of these notes to generate a response.
        </p>
      )}

      {isSynthesizing && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-blue-900">Generating insights...</p>
        </div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        {!result ? (
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Synthesize
          </button>
        ) : (
          <>
            <button
              onClick={() => setResult('')}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save as Note
            </button>
          </>
        )}
      </div>
    </div>
  );
}
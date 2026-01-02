import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoleSearch } from '../hooks/useRoleSearch';
import SearchResultItem from './SearchResultItem';

interface RoleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSearchModal: React.FC<RoleSearchModalProps> = ({ isOpen, onClose }) => {
  const { query, setQuery, results, isLoading, error, activeRole } = useRoleSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleSelect = (result: any) => {
    console.log('Selected:', result);
    // Navigate to result based on type
    // For now, just log and close
    onClose();
  };

  const handleClear = () => {
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="border-b p-4 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 text-lg outline-none placeholder:text-neutral-400"
            />
            {query && (
              <button
                onClick={handleClear}
                className="text-neutral-500 hover:text-neutral-700 px-2"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            {isLoading && (
              <div className="animate-spin text-neutral-400">⟳</div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && query ? (
              <div className="p-8 text-center text-neutral-500">
                <div className="animate-pulse">Searching...</div>
              </div>
            ) : results.length === 0 && query ? (
              <div className="p-8 text-center text-neutral-500">
                No results found for "{query}"
              </div>
            ) : !query ? (
              <div className="p-8 text-center text-neutral-500">
                Type to search {activeRole} resources
              </div>
            ) : (
              <div className="divide-y">
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelect(result)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 px-4 py-2 text-xs text-neutral-600 flex justify-between items-center">
            <div className="flex gap-3">
              <span><kbd className="px-1 bg-neutral-200 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 bg-neutral-200 rounded">Enter</kbd> Select</span>
              <span><kbd className="px-1 bg-neutral-200 rounded">Esc</kbd> Close</span>
            </div>
            <span className="font-medium">Role: {activeRole}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleSearchModal;

import React from 'react';
import { motion } from 'framer-motion';
import { SearchResult } from '../hooks/useRoleSearch';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  isSelected,
  onClick
}) => {
  const icons: Record<string, string> = {
    note: '📝',
    task: '✅',
    project: '📁',
    learning: '📚',
    team: '👥',
    template: '📋'
  };

  const roleBadges: Record<string, string> = {
    manager: 'bg-blue-100 text-blue-800',
    learner: 'bg-green-100 text-green-800',
    coach: 'bg-purple-100 text-purple-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className={`
        flex items-center gap-3 p-3 cursor-pointer border-l-4 transition-colors
        ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-neutral-50 border-transparent'}
      `}
      onClick={onClick}
    >
      <span className="text-xl">{icons[result.type] || '📄'}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-neutral-900 truncate">
          {result.title}
        </div>
        {result.description && (
          <div className="text-sm text-neutral-500 truncate">
            {result.description}
          </div>
        )}
      </div>
      <span className={`px-2 py-1 text-xs rounded ${roleBadges[result.role]}`}>
        {result.role}
      </span>
    </motion.div>
  );
};

export default SearchResultItem;

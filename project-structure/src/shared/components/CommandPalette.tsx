/**
 * Command Palette Component
 * Quick access to all app functions via keyboard with fuzzy matching
 *
 * @component
 * @description Modal overlay for command navigation and quick actions
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Settings,
  Tag,
  Network,
  Archive,
  Plus,
  Home,
  Trash2,
  Moon,
  Sun,
  Palette,
} from "lucide-react";
import { Input } from "../../shared/components/Input";
import { Card } from "../../shared/components/Card";

/**
 * Command definition for palette
 */
interface Command {
  /** Unique command identifier */
  id: string;

  /** Display name shown in list */
  name: string;

  /** Icon for visual identification */
  icon: React.ReactNode;

  /** Action to execute when selected */
  action: () => void;

  /** Category for grouping */
  category: "navigation" | "creation" | "settings" | "search";

  /** Keyboard shortcut hint */
  shortcut?: string;
}

/**
 * Command Palette Props
 */
interface CommandPaletteProps {
  /** Whether palette is open */
  isOpen: boolean;

  /** Callback to close palette */
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  /**
   * Define all available commands
   */
  const commands: Command[] = useMemo(
    () => [
      {
        id: "goto-notes",
        name: "Go to Notes",
        icon: <FileText className="w-4 h-4" />,
        action: () => {
          navigate("/notes");
          onClose();
        },
        category: "navigation",
        shortcut: "G N",
      },
      {
        id: "goto-graph",
        name: "Go to Graph View",
        icon: <Network className="w-4 h-4" />,
        action: () => {
          navigate("/graph");
          onClose();
        },
        category: "navigation",
        shortcut: "G G",
      },
      {
        id: "goto-search",
        name: "Go to Search",
        icon: <Search className="w-4 h-4" />,
        action: () => {
          navigate("/search");
          onClose();
        },
        category: "navigation",
        shortcut: "G S",
      },
      {
        id: "goto-tags",
        name: "Go to Tags",
        icon: <Tag className="w-4 h-4" />,
        action: () => {
          navigate("/tags");
          onClose();
        },
        category: "navigation",
        shortcut: "G T",
      },
      {
        id: "goto-settings",
        name: "Go to Settings",
        icon: <Settings className="w-4 h-4" />,
        action: () => {
          navigate("/settings");
          onClose();
        },
        category: "navigation",
        shortcut: "G ,",
      },
      {
        id: "goto-home",
        name: "Go to Home",
        icon: <Home className="w-4 h-4" />,
        action: () => {
          navigate("/");
          onClose();
        },
        category: "navigation",
        shortcut: "G H",
      },
      {
        id: "create-note",
        name: "Create New Note",
        icon: <Plus className="w-4 h-4" />,
        action: () => {
          navigate("/notes/new");
          onClose();
        },
        category: "creation",
        shortcut: "N",
      },
      {
        id: "toggle-theme",
        name: "Toggle Theme",
        icon: <Palette className="w-4 h-4" />,
        action: () => {
          // Will be implemented when theme context is available
          onClose();
        },
        category: "settings",
        shortcut: "T",
      },
      {
        id: "import-export",
        name: "Import / Export",
        icon: <Archive className="w-4 h-4" />,
        action: () => {
          navigate("/import-export");
          onClose();
        },
        category: "settings",
      },
    ],
    [navigate, onClose],
  );

  /**
   * Filter commands based on search query
   * Uses fuzzy matching with case-insensitive comparison
   */
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) {
      return commands;
    }

    const query = searchQuery.toLowerCase();
    return commands.filter((cmd) => {
      const nameMatch = cmd.name.toLowerCase().includes(query);
      const categoryMatch = cmd.category.toLowerCase().includes(query);
      return nameMatch || categoryMatch;
    });
  }, [searchQuery, commands]);

  /**
   * Group commands by category
   */
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      navigation: [],
      creation: [],
      settings: [],
      search: [],
    };

    filteredCommands.forEach((cmd) => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd);
      }
    });

    // Remove empty categories
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [filteredCommands]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? filteredCommands.length - 1 : prev - 1,
          );
          break;

        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose],
  );

  /**
   * Reset state when palette opens
   */
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  /**
   * Focus search input when palette opens
   */
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Command Palette Modal */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card
              variant="glass"
              className="overflow-hidden shadow-atmosphere border-white/20"
            >
              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <Input
                  ref={searchInputRef}
                  placeholder="Type a command or search..."
                  icon={<Search className="w-5 h-5 text-vibe-glow" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-none bg-transparent text-lg"
                />
              </div>

              {/* Command List */}
              <div
                className="max-h-[400px] overflow-y-auto p-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {Object.keys(groupedCommands).map((category, groupIndex) => (
                  <div key={category} className="mb-4 last:mb-0">
                    {/* Category Header */}
                    <div className="px-3 py-2">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                        {category}
                      </span>
                    </div>

                    {/* Commands in Category */}
                    {groupedCommands[category].map((cmd, cmdIndex) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => cmd.action()}
                          className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-xl
                            transition-all duration-150
                            ${
                              isSelected
                                ? "bg-vibe-glow/20 text-vibe-glow shadow-glow"
                                : "text-white/80 hover:bg-white/5"
                            }
                          `}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                              delay: groupIndex * 0.05 + cmdIndex * 0.02,
                            },
                          }}
                        >
                          {/* Command Icon */}
                          <div
                            className={`
                            flex-shrink-0 p-2 rounded-lg
                            ${isSelected ? "bg-vibe-glow/30" : "bg-white/5"}
                          `}
                          >
                            {cmd.icon}
                          </div>

                          {/* Command Name */}
                          <span className="flex-1 text-left font-medium">
                            {cmd.name}
                          </span>

                          {/* Shortcut Hint */}
                          {cmd.shortcut && (
                            <span className="text-[11px] text-white/30 font-mono">
                              {cmd.shortcut}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}

                {/* No Results */}
                {filteredCommands.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-12 h-12 text-white/20 mb-3" />
                    <p className="text-white/40 text-sm">
                      No commands found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with hint */}
              <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">↑↓</kbd>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd>
                  <span>to select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd>
                  <span>to close</span>
                </span>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Command Palette Hook
 * Manages palette state and provides toggle function
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Toggle palette open/closed
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Close palette
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Open palette
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
}

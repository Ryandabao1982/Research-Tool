import { ReactNode } from 'react';

// --- Core Data Models ---

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  folderId?: string;
  tags: string[];
  wordCount?: number;
  readingTime?: number;
  isFavorite?: boolean;
  isDailyNote?: boolean;
  time?: string; // For mock data/display purposes
  type?: string; // For mock data/display purposes
  hasAction?: boolean; // For mock data/display purposes
}

export type ActivityType = 'note_created' | 'note_updated' | 'note_deleted' | 'link_created' | 'ai_interaction';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  noteCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  noteCount?: number;
}

// --- Dashboard Specific Models ---

export interface HeatmapDataPoint {
  date: string;
  value: number;
  hasAction?: boolean;
  note?: Note | null;
}

export interface DashboardStats {
  notesCount: number;
  tasksPending: number;
  studyStreak: number;
  activityHeatmap: HeatmapDataPoint[];
  recentNotes: Note[];
  // Legacy fields (optional if needed for backward compat, or to be deprecated)
  totalFolders?: number;
  totalTags?: number;
  totalWords?: number;
  linksCreated?: number;
}

export interface FeedbackData {
  type: string;
  message: string;
  rating?: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  action: string;
  shortcut?: string;
}

export interface RecentActivity {
  id: string;
  type: ActivityType;
  noteId?: string;
  noteTitle?: string;
  timestamp: Date;
  details?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  highlights?: string[];
}

export interface AIConversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  messageCount: number;
}

// --- Component Props ---

export interface DashboardState {
  stats: DashboardStats | null;
  recentNotes: Note[];
  recentActivity: RecentActivity[];
  quickActions: QuickAction[];
  aiConversations: AIConversation[];
  isLoading: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
}

export interface LayoutProps {
  children: ReactNode;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export interface QuickActionCardProps {
  action: QuickAction;
  onClick: () => void;
}

export interface RecentNoteCardProps {
  note: Note;
  onClick: () => void;
  onFavorite: () => void;
}

export interface ActivityItemProps {
  activity: RecentActivity;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  results?: SearchResult[];
  isSearching?: boolean;
}

export interface SidebarProps {
  folders: Folder[];
  tags: Tag[];
  selectedFolderId?: string;
  selectedTagId?: string;
  onFolderSelect: (id: string | undefined) => void;
  onTagSelect: (id: string | undefined) => void;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  category: string;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  results: Command[];
}
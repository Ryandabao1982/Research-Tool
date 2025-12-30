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

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  shortcut?: string;
}

export interface DashboardStats {
  totalNotes: number;
  totalFolders: number;
  totalTags: number;
  recentNotesCount: number;
  favoriteNotesCount: number;
  dailyNotesCount: number;
  totalWords: number;
  linksCreated: number;
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

export interface DashboardState {
  stats: DashboardStats;
  recentNotes: Note[];
  recentActivity: RecentActivity[];
  quickActions: QuickAction[];
  aiConversations: AIConversation[];
  isLoading: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
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

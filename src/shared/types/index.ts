export * from './dashboard';

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

export interface LayoutProps {
  children: React.ReactNode;
}

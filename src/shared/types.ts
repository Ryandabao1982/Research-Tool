export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  folderId?: string | null;
}


export interface LayoutProps {
  children: React.ReactNode;
}
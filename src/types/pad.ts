export type PadColor = 'default' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'orange' | 'cyan' | 'slate';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface PadTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface PadNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  color: PadColor;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  tags: string[];
  checklist: ChecklistItem[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type PageOrientation = 'portrait' | 'landscape';
export type PageSize = 'letter' | 'a4' | 'legal';
export type MarginPreset = 'normal' | 'narrow' | 'moderate' | 'wide';

export interface DocumentSettings {
  margin: MarginPreset;
  orientation: PageOrientation;
  size: PageSize;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
  showRuler: boolean;
  viewMode: 'print' | 'web';
  pageTheme: 'white' | 'sepia' | 'dark';
}

export interface CommentItem {
  id: string;
  author: string;
  avatarColor: string;
  text: string;
  createdAt: number;
  resolved: boolean;
  selectedText?: string;
}

export interface TrackChangeItem {
  id: string;
  type: 'insert' | 'delete';
  author: string;
  text: string;
  timestamp: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  characterCount: number;
  settings: DocumentSettings;
  comments: CommentItem[];
  trackChanges: TrackChangeItem[];
  isTrackingEnabled: boolean;
}

export interface DocumentData extends DocumentMetadata {
  contentHtml: string;
}

export interface RevisionSnapshot {
  id: string;
  documentId: string;
  timestamp: number;
  title: string;
  contentHtml: string;
  wordCount: number;
}

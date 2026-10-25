import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { HomeTab } from './HomeTab';
import { InsertTab } from './InsertTab';
import { LayoutTab } from './LayoutTab';
import { ReviewTab } from './ReviewTab';
import { ViewTab } from './ViewTab';
import type { DocumentSettings } from '../../types/document';

export type RibbonTab = 'file' | 'home' | 'insert' | 'layout' | 'review' | 'view';

interface RibbonProps {
  editor: Editor | null;
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  onOpenBackstage: () => void;
  onOpenFindReplace: (mode: 'find' | 'replace') => void;
  onOpenStatistics: () => void;
  onOpenComments: () => void;
  onAddComment: () => void;
  onOpenHeaderFooter: () => void;
  isTrackingEnabled: boolean;
  onToggleTrackChanges: () => void;
  commentCount: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export const Ribbon: React.FC<RibbonProps> = ({
  editor,
  settings,
  onUpdateSettings,
  onOpenBackstage,
  onOpenFindReplace,
  onOpenStatistics,
  onOpenComments,
  onAddComment,
  onOpenHeaderFooter,
  isTrackingEnabled,
  onToggleTrackChanges,
  commentCount,
  zoom,
  onZoomChange,
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);

  const handleTabClick = (tab: RibbonTab) => {
    if (tab === 'file') {
      onOpenBackstage();
      return;
    }
    if (isRibbonCollapsed) {
      setIsRibbonCollapsed(false);
    }
    setActiveTab(tab);
  };

  return (
    <div className={`word-ribbon-container ${isRibbonCollapsed ? 'collapsed' : ''}`}>
      {/* Ribbon Navigation Bar */}
      <nav className="word-ribbon-tabs" role="tablist">
        <button
          className="word-tab-btn file-tab"
          onClick={() => handleTabClick('file')}
          role="tab"
          aria-selected={false}
        >
          File
        </button>

        <button
          className={`word-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleTabClick('home')}
          role="tab"
          aria-selected={activeTab === 'home'}
        >
          Home
        </button>

        <button
          className={`word-tab-btn ${activeTab === 'insert' ? 'active' : ''}`}
          onClick={() => handleTabClick('insert')}
          role="tab"
          aria-selected={activeTab === 'insert'}
        >
          Insert
        </button>

        <button
          className={`word-tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => handleTabClick('layout')}
          role="tab"
          aria-selected={activeTab === 'layout'}
        >
          Layout
        </button>

        <button
          className={`word-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => handleTabClick('review')}
          role="tab"
          aria-selected={activeTab === 'review'}
        >
          Review
        </button>

        <button
          className={`word-tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => handleTabClick('view')}
          role="tab"
          aria-selected={activeTab === 'view'}
        >
          View
        </button>

        <button
          className="word-ribbon-collapse-toggle"
          onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
          title={isRibbonCollapsed ? 'Pin the ribbon (Ctrl+F1)' : 'Collapse the ribbon (Ctrl+F1)'}
          aria-label="Collapse ribbon"
        >
          {isRibbonCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </nav>

      {/* Active Tab Panel */}
      {!isRibbonCollapsed && (
        <div className="word-ribbon-body" role="tabpanel">
          {activeTab === 'home' && (
            <HomeTab editor={editor} onOpenFindReplace={onOpenFindReplace} />
          )}
          {activeTab === 'insert' && (
            <InsertTab
              editor={editor}
              onAddComment={onAddComment}
              onOpenHeaderFooter={onOpenHeaderFooter}
            />
          )}
          {activeTab === 'layout' && (
            <LayoutTab settings={settings} onUpdateSettings={onUpdateSettings} />
          )}
          {activeTab === 'review' && (
            <ReviewTab
              onOpenStatistics={onOpenStatistics}
              onOpenComments={onOpenComments}
              onAddComment={onAddComment}
              isTrackingEnabled={isTrackingEnabled}
              onToggleTrackChanges={onToggleTrackChanges}
              commentCount={commentCount}
            />
          )}
          {activeTab === 'view' && (
            <ViewTab
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              zoom={zoom}
              onZoomChange={onZoomChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

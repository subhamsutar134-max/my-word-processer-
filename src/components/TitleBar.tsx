import React, { useState, useEffect } from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Printer,
  FileText,
  Search,
  Moon,
  Sun,
  MessageSquare,
  History,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';

interface TitleBarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPrint: () => void;
  onOpenBackstage: () => void;
  onToggleComments: () => void;
  onToggleHistory: () => void;
  commentCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onQuickSearch: () => void;
  onQuickDocxExport: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  onTitleChange,
  isSaving,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onPrint,
  onOpenBackstage,
  onToggleComments,
  onToggleHistory,
  commentCount,
  darkMode,
  onToggleDarkMode,
  onQuickSearch,
  onQuickDocxExport,
}) => {
  const [editingTitle, setEditingTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditingTitle(title);
  }, [title]);

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (editingTitle.trim()) {
      onTitleChange(editingTitle.trim());
    } else {
      setEditingTitle(title);
    }
  };

  return (
    <header className="word-titlebar" role="banner">
      {/* Left: Office Word Logo & Quick Access */}
      <div className="word-titlebar-left">
        <button
          className="word-app-button"
          onClick={onOpenBackstage}
          title="File / Backstage Menu (Alt+F)"
          aria-label="File menu"
        >
          <div className="word-icon-badge">
            <span className="word-icon-letter">W</span>
          </div>
          <span className="word-app-label">Word</span>
        </button>

        <div className="word-quick-access">
          <button
            className="word-quick-btn"
            onClick={onSave}
            title="Save Document (Ctrl+S)"
            aria-label="Save"
          >
            <Save size={15} />
          </button>
          <button
            className="word-quick-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            className="word-quick-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={15} />
          </button>
          <button
            className="word-quick-btn"
            onClick={onPrint}
            title="Print Document (Ctrl+P)"
            aria-label="Print"
          >
            <Printer size={15} />
          </button>
          <button
            className="word-quick-btn"
            onClick={onQuickDocxExport}
            title="Download as DOCX"
            aria-label="Download DOCX"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Center: Document Title & Autosave Badge */}
      <div className="word-titlebar-center">
        {isEditing ? (
          <input
            type="text"
            className="word-title-input"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setEditingTitle(title);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <div
            className="word-title-display"
            onClick={() => setIsEditing(true)}
            title="Click to rename document"
          >
            <FileText size={15} className="word-doc-icon" />
            <span className="word-title-text">{title}</span>
            <span className="word-title-ext">.docx</span>
          </div>
        )}

        <div className="word-save-status" title={isSaving ? 'Autosaving...' : 'Saved to browser storage'}>
          {isSaving ? (
            <>
              <Clock size={12} className="spinning" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="saved-icon" />
              <span>Saved</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Search, Features, Comments, Dark mode */}
      <div className="word-titlebar-right">
        <button
          className="word-search-trigger"
          onClick={onQuickSearch}
          title="Search or type a command (Ctrl+F)"
        >
          <Search size={14} />
          <span className="word-search-placeholder">Find in document...</span>
          <kbd className="word-kbd">Ctrl+F</kbd>
        </button>

        <button
          className={`word-title-btn ${commentCount > 0 ? 'active' : ''}`}
          onClick={onToggleComments}
          title="Review Comments"
          aria-label="Comments"
        >
          <MessageSquare size={16} />
          {commentCount > 0 && <span className="word-badge">{commentCount}</span>}
        </button>

        <button
          className="word-title-btn"
          onClick={onToggleHistory}
          title="Version History & Snapshots"
          aria-label="Version history"
        >
          <History size={16} />
        </button>

        <button
          className="word-title-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

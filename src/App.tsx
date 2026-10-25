import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { Ribbon } from './components/Ribbon/Ribbon';
import { HorizontalRuler } from './components/Ruler/HorizontalRuler';
import { WordEditor } from './components/Editor/WordEditor';
import { StatusBar } from './components/StatusBar/StatusBar';
import { BackstageModal } from './components/Backstage/BackstageModal';
import { CommentsSidebar } from './components/Sidebars/CommentsSidebar';
import { FindReplaceModal } from './components/Sidebars/FindReplaceModal';
import { StatisticsModal } from './components/Sidebars/StatisticsModal';
import { HeaderFooterModal } from './components/Sidebars/HeaderFooterModal';
import { VersionHistoryModal } from './components/Sidebars/VersionHistoryModal';

import type {
  DocumentData,
  DocumentMetadata,
  DocumentSettings,
  CommentItem,
  RevisionSnapshot,
} from './types/document';
import {
  saveDocument,
  loadDocument,
  listDocuments,
  deleteDocument,
  saveRevision,
  getRevisions,
  getLastOpenedDocumentId,
  createDefaultDocument,
} from './db/documentStorage';
import { exportToDocx } from './utils/docxExport';
import { importDocxFile } from './utils/docxImport';
import { computeStatistics } from './utils/statistics';
import './App.css';

export const App: React.FC = () => {
  const [currentDoc, setCurrentDoc] = useState<DocumentData>(createDefaultDocument);
  const [recentDocs, setRecentDocs] = useState<DocumentMetadata[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [darkMode, setDarkMode] = useState(false);

  // Modals & Panels
  const [isBackstageOpen, setIsBackstageOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [findReplaceState, setFindReplaceState] = useState<{ isOpen: boolean; mode: 'find' | 'replace' }>({
    isOpen: false,
    mode: 'find',
  });
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isHeaderFooterOpen, setIsHeaderFooterOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Editor instance & active selection
  const [editor, setEditor] = useState<any>(null);
  const [selectedText, setSelectedText] = useState('');
  const [revisions, setRevisions] = useState<RevisionSnapshot[]>([]);

  const saveTimerRef = useRef<any>(null);

  // Initialize: Load last opened document or populate default
  useEffect(() => {
    async function initStorage() {
      try {
        const lastId = await getLastOpenedDocumentId();
        if (lastId) {
          const doc = await loadDocument(lastId);
          if (doc) {
            setCurrentDoc(doc);
            const revs = await getRevisions(doc.id);
            setRevisions(revs);
          }
        } else {
          const defaultDoc = createDefaultDocument();
          await saveDocument(defaultDoc);
          setCurrentDoc(defaultDoc);
        }
        refreshDocList();
      } catch (err) {
        console.error('Failed to initialize document storage:', err);
      }
    }
    initStorage();
  }, []);

  const refreshDocList = async () => {
    try {
      const list = await listDocuments();
      setRecentDocs(list);
    } catch (err) {
      console.error('Error listing documents:', err);
    }
  };

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Debounced auto-save handler
  const scheduleAutosave = useCallback(
    (updatedDoc: DocumentData) => {
      setIsSaving(true);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        try {
          await saveDocument(updatedDoc);
          refreshDocList();
        } catch (err) {
          console.error('Autosave error:', err);
        } finally {
          setIsSaving(false);
        }
      }, 1200);
    },
    []
  );

  // Content change callback from TipTap
  const handleContentChange = (html: string, wordCount: number, charCount: number) => {
    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        contentHtml: html,
        wordCount,
        characterCount: charCount,
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });
  };

  // Settings update
  const handleUpdateSettings = (newSettings: Partial<DocumentSettings>) => {
    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings,
        },
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });
  };

  // Document Title update
  const handleTitleChange = (newTitle: string) => {
    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        title: newTitle,
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });
  };

  // Create new document from template
  const handleNewDocument = async (templateHtml = '<p></p>', templateTitle = 'Untitled Document') => {
    const newDoc = createDefaultDocument(templateTitle);
    newDoc.contentHtml = templateHtml;
    const stats = computeStatistics(templateHtml);
    newDoc.wordCount = stats.words;
    newDoc.characterCount = stats.characters;

    await saveDocument(newDoc);
    setCurrentDoc(newDoc);
    await refreshDocList();

    // Create initial baseline snapshot
    const initialRev: RevisionSnapshot = {
      id: 'rev_' + Date.now(),
      documentId: newDoc.id,
      timestamp: Date.now(),
      title: 'Created from ' + templateTitle,
      contentHtml: newDoc.contentHtml,
      wordCount: newDoc.wordCount,
    };
    await saveRevision(initialRev);
    setRevisions([initialRev]);
  };

  // Open existing document
  const handleOpenDocument = async (id: string) => {
    const doc = await loadDocument(id);
    if (doc) {
      setCurrentDoc(doc);
      const revs = await getRevisions(doc.id);
      setRevisions(revs);
      refreshDocList();
    }
  };

  // Delete document
  const handleDeleteDocument = async (id: string) => {
    await deleteDocument(id);
    await refreshDocList();
    if (currentDoc.id === id) {
      const remaining = await listDocuments();
      if (remaining.length > 0) {
        handleOpenDocument(remaining[0].id);
      } else {
        handleNewDocument();
      }
    }
  };

  // Import external .docx file
  const handleImportDocx = async (file: File) => {
    try {
      const { html, title } = await importDocxFile(file);
      await handleNewDocument(html, title);
    } catch (err) {
      console.error('Failed to import docx:', err);
      alert('Error importing Word document: ' + (err as Error).message);
    }
  };

  // Export current document as authentic .docx file
  const handleExportDocx = async () => {
    try {
      await exportToDocx(currentDoc.contentHtml, currentDoc.title, currentDoc.settings);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate DOCX file: ' + (err as Error).message);
    }
  };

  // Print document
  const handlePrint = () => {
    window.print();
  };

  // Manual point-in-time snapshot
  const handleCreateSnapshot = async (label = 'Manual Snapshot') => {
    const snapshot: RevisionSnapshot = {
      id: 'rev_' + Date.now(),
      documentId: currentDoc.id,
      timestamp: Date.now(),
      title: label,
      contentHtml: currentDoc.contentHtml,
      wordCount: currentDoc.wordCount,
    };
    await saveRevision(snapshot);
    const updated = await getRevisions(currentDoc.id);
    setRevisions(updated);
  };

  // Restore snapshot
  const handleRestoreRevision = (snapshot: RevisionSnapshot) => {
    if (editor) {
      editor.commands.setContent(snapshot.contentHtml);
    }
    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        contentHtml: snapshot.contentHtml,
        wordCount: snapshot.wordCount,
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });
  };

  // Comments management
  const handleAddComment = (text: string, anchorText?: string) => {
    const commentId = 'c_' + Date.now();
    const newComment: CommentItem = {
      id: commentId,
      author: 'Author',
      avatarColor: '#185abd',
      text,
      createdAt: Date.now(),
      resolved: false,
      selectedText: anchorText || selectedText || undefined,
    };

    if (editor && (anchorText || selectedText)) {
      editor.commands.setComment(commentId);
    }

    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        comments: [newComment, ...prev.comments],
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });

    setIsCommentsOpen(true);
    setSelectedText('');
  };

  const handleToggleResolveComment = (id: string) => {
    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        comments: prev.comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });
  };

  const handleDeleteComment = (id: string) => {
    setCurrentDoc((prev) => {
      const updated: DocumentData = {
        ...prev,
        comments: prev.comments.filter((c) => c.id !== id),
        updatedAt: Date.now(),
      };
      scheduleAutosave(updated);
      return updated;
    });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Save immediately
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDocument(currentDoc);
        handleCreateSnapshot('Saved via Ctrl+S');
        setIsSaving(false);
      }
      // Ctrl+P or Cmd+P: Print
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
      // Ctrl+F or Cmd+F: Find
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && !e.shiftKey) {
        e.preventDefault();
        setFindReplaceState({ isOpen: true, mode: 'find' });
      }
      // Ctrl+H or Cmd+H: Replace
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindReplaceState({ isOpen: true, mode: 'replace' });
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsBackstageOpen(false);
        setFindReplaceState({ isOpen: false, mode: 'find' });
        setIsStatisticsOpen(false);
        setIsHeaderFooterOpen(false);
        setIsHistoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDoc]);

  const stats = computeStatistics(currentDoc.contentHtml);

  return (
    <div className={`word-application-root ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* 1. Word Title & Quick Access Bar */}
      <TitleBar
        title={currentDoc.title}
        onTitleChange={handleTitleChange}
        isSaving={isSaving}
        canUndo={editor?.can().undo() ?? false}
        canRedo={editor?.can().redo() ?? false}
        onUndo={() => editor?.chain().focus().undo().run()}
        onRedo={() => editor?.chain().focus().redo().run()}
        onSave={() => {
          saveDocument(currentDoc);
          handleCreateSnapshot('Manual Save');
        }}
        onPrint={handlePrint}
        onOpenBackstage={() => setIsBackstageOpen(true)}
        onToggleComments={() => setIsCommentsOpen(!isCommentsOpen)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        commentCount={currentDoc.comments.filter((c) => !c.resolved).length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onQuickSearch={() => setFindReplaceState({ isOpen: true, mode: 'find' })}
        onQuickDocxExport={handleExportDocx}
      />

      {/* 2. Fluent Ribbon Toolbar */}
      <Ribbon
        editor={editor}
        settings={currentDoc.settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenBackstage={() => setIsBackstageOpen(true)}
        onOpenFindReplace={(mode) => setFindReplaceState({ isOpen: true, mode })}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
        onOpenComments={() => setIsCommentsOpen(true)}
        onAddComment={() => {
          const text = window.prompt('Enter comment text:');
          if (text) handleAddComment(text);
        }}
        onOpenHeaderFooter={() => setIsHeaderFooterOpen(true)}
        isTrackingEnabled={currentDoc.isTrackingEnabled}
        onToggleTrackChanges={() => {
          const next = !currentDoc.isTrackingEnabled;
          setCurrentDoc((prev) => ({ ...prev, isTrackingEnabled: next }));
        }}
        commentCount={currentDoc.comments.filter((c) => !c.resolved).length}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* 3. Horizontal Ruler */}
      {currentDoc.settings.showRuler && currentDoc.settings.viewMode === 'print' && (
        <HorizontalRuler margin={currentDoc.settings.margin} zoom={zoom} />
      )}

      {/* 4. Document Canvas Workspace & Sidebars */}
      <div className="word-workspace-container">
        <WordEditor
          key={currentDoc.id}
          documentId={currentDoc.id}
          initialContent={currentDoc.contentHtml}
          settings={currentDoc.settings}
          zoom={zoom}
          onContentChange={handleContentChange}
          onEditorReady={setEditor}
          onSelectionCommentable={setSelectedText}
        />

        {/* Comments Right Drawer */}
        <CommentsSidebar
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          comments={currentDoc.comments}
          onAddComment={handleAddComment}
          onToggleResolve={handleToggleResolveComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>

      {/* 5. Word Status Bar */}
      <StatusBar
        pageCount={1}
        wordCount={currentDoc.wordCount}
        characterCount={currentDoc.characterCount}
        isSaving={isSaving}
        settings={currentDoc.settings}
        onUpdateSettings={handleUpdateSettings}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
      />

      {/* 6. Modals & Overlays */}
      <BackstageModal
        isOpen={isBackstageOpen}
        onClose={() => setIsBackstageOpen(false)}
        currentDoc={currentDoc}
        recentDocs={recentDocs}
        onOpenDoc={handleOpenDocument}
        onNewDoc={handleNewDocument}
        onDeleteDoc={handleDeleteDocument}
        onImportDocx={handleImportDocx}
        onExportDocx={handleExportDocx}
        onPrint={handlePrint}
      />

      <FindReplaceModal
        isOpen={findReplaceState.isOpen}
        initialMode={findReplaceState.mode}
        onClose={() => setFindReplaceState({ isOpen: false, mode: 'find' })}
        editor={editor}
      />

      <StatisticsModal
        isOpen={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
        stats={stats}
        pageCount={1}
      />

      <HeaderFooterModal
        isOpen={isHeaderFooterOpen}
        onClose={() => setIsHeaderFooterOpen(false)}
        settings={currentDoc.settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        revisions={revisions}
        onRestoreRevision={handleRestoreRevision}
        onCreateSnapshot={handleCreateSnapshot}
      />
    </div>
  );
};

export default App;

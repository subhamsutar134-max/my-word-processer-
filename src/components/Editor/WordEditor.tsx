import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import { PageBreak } from './extensions/PageBreak';
import { LineHeight } from './extensions/LineHeight';
import { FontSize } from './extensions/FontSize';
import { CommentMark } from './extensions/CommentMark';
import type { DocumentSettings } from '../../types/document';
import { computeStatistics } from '../../utils/statistics';

interface WordEditorProps {
  documentId: string;
  initialContent: string;
  settings: DocumentSettings;
  zoom: number;
  onContentChange: (html: string, wordCount: number, charCount: number) => void;
  onEditorReady: (editorInstance: any) => void;
  onSelectionCommentable?: (selectedText: string) => void;
}

export const WordEditor: React.FC<WordEditorProps> = ({
  documentId,
  initialContent,
  settings,
  zoom,
  onContentChange,
  onEditorReady,
  onSelectionCommentable,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      PageBreak,
      LineHeight,
      FontSize,
      CommentMark,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'word-tiptap-editor',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const stats = computeStatistics(html);
      onContentChange(html, stats.words, stats.characters);
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionCommentable) {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (text && text.trim().length > 0) {
          onSelectionCommentable(text.trim());
        }
      }
    },
  });

  const currentDocIdRef = useRef(documentId);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Keep editor content in sync ONLY when switching to a different document
  useEffect(() => {
    if (editor && documentId !== currentDocIdRef.current) {
      currentDocIdRef.current = documentId;
      editor.commands.setContent(initialContent);
    }
  }, [editor, documentId, initialContent]);

  // Derive paper dimensions class
  const pageClassNames = [
    'word-paper-sheet',
    `margin-${settings.margin}`,
    `orientation-${settings.orientation}`,
    `size-${settings.size}`,
    `theme-${settings.pageTheme}`,
    settings.viewMode === 'web' ? 'view-web' : 'view-print',
  ].join(' ');

  return (
    <main className="word-editor-scroll-viewport" role="main">
      <div
        className="word-page-zoom-wrapper"
        style={{
          transform: settings.viewMode === 'print' ? `scale(${zoom / 100})` : 'none',
          transformOrigin: 'top center',
        }}
      >
        <div className={pageClassNames}>
          {/* Header Zone (visible in Print layout) */}
          {settings.viewMode === 'print' && (
            <header className="word-paper-header" aria-label="Page header">
              <span className="paper-header-text">{settings.headerText}</span>
              <span className="paper-header-rule" />
            </header>
          )}

          {/* Editable Document Body */}
          <div className="word-paper-body">
            <EditorContent editor={editor} />
          </div>

          {/* Footer Zone (visible in Print layout) */}
          {settings.viewMode === 'print' && (
            <footer className="word-paper-footer" aria-label="Page footer">
              <span className="paper-footer-rule" />
              <div className="paper-footer-content">
                <span className="paper-footer-text">{settings.footerText}</span>
                {settings.showPageNumbers && (
                  <span className="paper-page-number">Page 1</span>
                )}
              </div>
            </footer>
          )}
        </div>
      </div>
    </main>
  );
};

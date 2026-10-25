import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  RemoveFormatting,
  Highlighter,
  Search,
  Replace,
  Baseline,
} from 'lucide-react';

interface HomeTabProps {
  editor: Editor | null;
  onOpenFindReplace: (mode: 'find' | 'replace') => void;
}

const FONT_FAMILIES = [
  { label: 'Calibri (Body)', value: 'Calibri, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
];

const FONT_SIZES = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '24pt', '32pt', '48pt', '72pt'];
const LINE_SPACINGS = [
  { label: '1.0 (Single)', value: '1.0' },
  { label: '1.15 (Office)', value: '1.15' },
  { label: '1.5 (Standard)', value: '1.5' },
  { label: '2.0 (Double)', value: '2.0' },
];

export const HomeTab: React.FC<HomeTabProps> = ({ editor, onOpenFindReplace }) => {
  if (!editor) return null;

  const currentFont = editor.getAttributes('textStyle').fontFamily || 'Calibri, sans-serif';
  const currentSize = editor.getAttributes('textStyle').fontSize || '11pt';

  return (
    <div className="word-ribbon-tab-content">
      {/* Group 1: Clipboard & Clear */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear All Formatting"
          >
            <RemoveFormatting size={18} />
            <span className="btn-label-small">Clear</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Clipboard</div>
      </div>

      {/* Group 2: Font Controls */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items font-grid">
          {/* Row 1: Font Family, Size, Size +/- */}
          <div className="word-ribbon-subrow">
            <select
              className="word-select word-font-select"
              value={currentFont}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              title="Font Family"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            <select
              className="word-select word-size-select"
              value={currentSize}
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              title="Font Size"
            >
              {FONT_SIZES.map((sz) => (
                <option key={sz} value={sz}>
                  {sz.replace('pt', '')}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Bold, Italic, Underline, Strike, Sub/Super, Colors */}
          <div className="word-ribbon-subrow">
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('underline') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl+U)"
            >
              <Underline size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('strike') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <Strikethrough size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('subscript') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              title="Subscript"
            >
              <Subscript size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('superscript') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              title="Superscript"
            >
              <Superscript size={15} />
            </button>

            {/* Text Color Picker Dropdown */}
            <div className="word-color-picker-wrapper">
              <label className="word-ribbon-btn-icon color-label" title="Font Color">
                <Baseline size={15} />
                <input
                  type="color"
                  className="word-hidden-color-input"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                />
              </label>
            </div>

            {/* Highlight Color Picker */}
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('highlight') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffea79' }).run()}
              title="Text Highlight Color (Yellow)"
            >
              <Highlighter size={15} />
            </button>
          </div>
        </div>
        <div className="word-ribbon-group-label">Font</div>
      </div>

      {/* Group 3: Paragraph Controls */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items font-grid">
          {/* Row 1: Lists & Line Spacing */}
          <div className="word-ribbon-subrow">
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('bulletList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bulleted List"
            >
              <List size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('orderedList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <ListOrdered size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive('taskList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Checklist / Task List"
            >
              <ListTodo size={15} />
            </button>

            <select
              className="word-select word-spacing-select"
              title="Line Spacing"
              onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
              defaultValue="1.25"
            >
              {LINE_SPACINGS.map((ls) => (
                <option key={ls.value} value={ls.value}>
                  {ls.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Text Alignments */}
          <div className="word-ribbon-subrow">
            <button
              className={`word-ribbon-btn-icon ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align Left (Ctrl+L)"
            >
              <AlignLeft size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align Center (Ctrl+E)"
            >
              <AlignCenter size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align Right (Ctrl+R)"
            >
              <AlignRight size={15} />
            </button>
            <button
              className={`word-ribbon-btn-icon ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              title="Justify (Ctrl+J)"
            >
              <AlignJustify size={15} />
            </button>
          </div>
        </div>
        <div className="word-ribbon-group-label">Paragraph</div>
      </div>

      {/* Group 4: Styles Gallery */}
      <div className="word-ribbon-group styles-group">
        <div className="word-ribbon-styles-gallery">
          <button
            className={`word-style-card ${editor.isActive('paragraph') && !editor.isActive('heading') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <span className="style-preview normal">Normal</span>
          </button>
          <button
            className={`word-style-card ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <span className="style-preview h1">Heading 1</span>
          </button>
          <button
            className={`word-style-card ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <span className="style-preview h2">Heading 2</span>
          </button>
          <button
            className={`word-style-card ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <span className="style-preview h3">Heading 3</span>
          </button>
          <button
            className={`word-style-card ${editor.isActive('blockquote') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <span className="style-preview quote">Quote</span>
          </button>
          <button
            className={`word-style-card ${editor.isActive('codeBlock') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <span className="style-preview code">Code</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Styles</div>
      </div>

      {/* Group 5: Editing (Find & Replace, Select All) */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items vertical-stack">
          <button
            className="word-ribbon-compact-btn"
            onClick={() => onOpenFindReplace('find')}
            title="Find (Ctrl+F)"
          >
            <Search size={14} />
            <span>Find</span>
          </button>
          <button
            className="word-ribbon-compact-btn"
            onClick={() => onOpenFindReplace('replace')}
            title="Replace (Ctrl+H)"
          >
            <Replace size={14} />
            <span>Replace</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Editing</div>
      </div>
    </div>
  );
};

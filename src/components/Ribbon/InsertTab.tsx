import React, { useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  SeparatorHorizontal,
  MessageSquarePlus,
  Minus,
  Trash2,
  Columns,
  Rows,
  SplitSquareVertical,
  MinusSquare,
} from 'lucide-react';

interface InsertTabProps {
  editor: Editor | null;
  onAddComment: () => void;
  onOpenHeaderFooter: () => void;
}

export const InsertTab: React.FC<InsertTabProps> = ({
  editor,
  onAddComment,
  onOpenHeaderFooter,
}) => {
  const [showTablePicker, setShowTablePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const isTableActive = editor.isActive('table');

  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTablePicker(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter hyperlink URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="word-ribbon-tab-content">
      {/* Group 1: Pages */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            onClick={() => editor.chain().focus().setPageBreak().run()}
            title="Insert Page Break (Ctrl+Enter)"
          >
            <SeparatorHorizontal size={18} />
            <span className="btn-label-small">Page Break</span>
          </button>
          <button
            className="word-ribbon-tool-btn"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Insert Horizontal Divider"
          >
            <MinusSquare size={18} />
            <span className="btn-label-small">Divider</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Pages</div>
      </div>

      {/* Group 2: Tables */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items relative">
          <button
            className="word-ribbon-tool-btn"
            onClick={() => setShowTablePicker(!showTablePicker)}
            title="Insert Table Grid"
          >
            <TableIcon size={18} />
            <span className="btn-label-small">Table</span>
          </button>

          {showTablePicker && (
            <div className="word-table-picker-popup">
              <div className="table-picker-header">Insert Table</div>
              <div className="table-picker-grid">
                {[
                  { r: 2, c: 2, label: '2 × 2' },
                  { r: 3, c: 3, label: '3 × 3' },
                  { r: 4, c: 3, label: '4 × 3' },
                  { r: 4, c: 4, label: '4 × 4' },
                  { r: 5, c: 5, label: '5 × 5' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="table-grid-btn"
                    onClick={() => handleInsertTable(item.r, item.c)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTableActive && (
            <div className="word-table-actions-strip">
              <button
                className="word-ribbon-compact-btn"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="Add Row Below"
              >
                <Rows size={13} />
                <span>+ Row</span>
              </button>
              <button
                className="word-ribbon-compact-btn"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="Add Column Right"
              >
                <Columns size={13} />
                <span>+ Col</span>
              </button>
              <button
                className="word-ribbon-compact-btn danger"
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Current Row"
              >
                <Minus size={13} />
                <span>- Row</span>
              </button>
              <button
                className="word-ribbon-compact-btn danger"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Current Column"
              >
                <Minus size={13} />
                <span>- Col</span>
              </button>
              <button
                className="word-ribbon-compact-btn danger"
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Delete Entire Table"
              >
                <Trash2 size={13} />
                <span>Del Table</span>
              </button>
            </div>
          )}
        </div>
        <div className="word-ribbon-group-label">Tables</div>
      </div>

      {/* Group 3: Media & Illustrations */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            className="word-ribbon-tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload and insert picture"
          >
            <ImageIcon size={18} />
            <span className="btn-label-small">Pictures</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Illustrations</div>
      </div>

      {/* Group 4: Links & Annotations */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className={`word-ribbon-tool-btn ${editor.isActive('link') ? 'active' : ''}`}
            onClick={handleInsertLink}
            title="Insert or Edit Hyperlink (Ctrl+K)"
          >
            <LinkIcon size={18} />
            <span className="btn-label-small">Link</span>
          </button>
          <button
            className="word-ribbon-tool-btn"
            onClick={onAddComment}
            title="Add Review Comment on selected text"
          >
            <MessageSquarePlus size={18} />
            <span className="btn-label-small">Comment</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Comments & Links</div>
      </div>

      {/* Group 5: Header & Footer */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            onClick={onOpenHeaderFooter}
            title="Edit Header & Footer Text"
          >
            <SplitSquareVertical size={18} />
            <span className="btn-label-small">Header/Footer</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Header & Footer</div>
      </div>
    </div>
  );
};

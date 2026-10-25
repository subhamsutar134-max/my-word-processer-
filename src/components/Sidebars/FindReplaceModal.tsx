import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { X } from 'lucide-react';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  initialMode?: 'find' | 'replace';
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  editor,
  initialMode = 'find',
}) => {
  const [activeTab, setActiveTab] = useState<'find' | 'replace'>(initialMode);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  if (!isOpen || !editor) return null;

  const handleFindNext = () => {
    if (!findText) return;
    const text = editor.getText();
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(findText, flags);
    const matches = [...text.matchAll(regex)];

    if (matches.length === 0) {
      setStatusMessage('No matches found.');
      return;
    }

    setStatusMessage(`Found ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}.`);
  };

  const handleReplace = () => {
    if (!findText) return;
    const content = editor.getHTML();
    const flags = matchCase ? '' : 'i';
    const regex = new RegExp(findText, flags);

    if (regex.test(content)) {
      const updated = content.replace(regex, replaceText);
      editor.commands.setContent(updated);
      setStatusMessage('Replaced 1 occurrence.');
    } else {
      setStatusMessage('Item not found.');
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const content = editor.getHTML();
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(findText, flags);

    const matches = content.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      const updated = content.replace(regex, replaceText);
      editor.commands.setContent(updated);
      setStatusMessage(`Replaced all ${count} occurrences.`);
    } else {
      setStatusMessage('No occurrences found to replace.');
    }
  };

  return (
    <div className="word-find-replace-dialog" role="dialog" aria-labelledby="fr-title">
      <div className="fr-dialog-header">
        <div className="fr-tabs">
          <button
            className={`fr-tab-btn ${activeTab === 'find' ? 'active' : ''}`}
            onClick={() => setActiveTab('find')}
          >
            Find
          </button>
          <button
            className={`fr-tab-btn ${activeTab === 'replace' ? 'active' : ''}`}
            onClick={() => setActiveTab('replace')}
          >
            Replace
          </button>
        </div>
        <button className="fr-close-btn" onClick={onClose} title="Close">
          <X size={15} />
        </button>
      </div>

      <div className="fr-dialog-body">
        <div className="fr-input-group">
          <label className="fr-label">Find what:</label>
          <input
            type="text"
            className="fr-text-input"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Type text to search..."
            autoFocus
          />
        </div>

        {activeTab === 'replace' && (
          <div className="fr-input-group">
            <label className="fr-label">Replace with:</label>
            <input
              type="text"
              className="fr-text-input"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>
        )}

        <div className="fr-options-row">
          <label className="word-checkbox-label">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
            />
            <span>Match case</span>
          </label>
        </div>

        {statusMessage && <div className="fr-status-message">{statusMessage}</div>}

        <div className="fr-actions-row">
          <button className="word-btn-secondary btn-sm" onClick={handleFindNext}>
            Find Next
          </button>

          {activeTab === 'replace' && (
            <>
              <button className="word-btn-secondary btn-sm" onClick={handleReplace}>
                Replace
              </button>
              <button className="word-btn-primary btn-sm" onClick={handleReplaceAll}>
                Replace All
              </button>
            </>
          )}

          <button className="word-btn-secondary btn-sm ml-auto" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

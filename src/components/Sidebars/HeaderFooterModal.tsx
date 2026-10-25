import React, { useState } from 'react';
import { X, SplitSquareVertical } from 'lucide-react';
import type { DocumentSettings } from '../../types/document';

interface HeaderFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
}

export const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [headerText, setHeaderText] = useState(settings.headerText);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [showPageNumbers, setShowPageNumbers] = useState(settings.showPageNumbers);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings({
      headerText,
      footerText,
      showPageNumbers,
    });
    onClose();
  };

  return (
    <div className="word-modal-backdrop" onClick={onClose}>
      <div className="word-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <div className="stats-title-row">
            <SplitSquareVertical size={16} className="text-primary" />
            <h3>Header & Footer Options</h3>
          </div>
          <button className="stats-close-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="stats-modal-body">
          <div className="fr-input-group">
            <label className="fr-label">Header Text (Top of each page):</label>
            <input
              type="text"
              className="fr-text-input"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="e.g. Confidential Project Report"
            />
          </div>

          <div className="fr-input-group">
            <label className="fr-label">Footer Text (Bottom of each page):</label>
            <input
              type="text"
              className="fr-text-input"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="e.g. Internal Use Only"
            />
          </div>

          <div className="fr-options-row">
            <label className="word-checkbox-label">
              <input
                type="checkbox"
                checked={showPageNumbers}
                onChange={(e) => setShowPageNumbers(e.target.checked)}
              />
              <span>Include dynamic page numbers in footer ("Page 1")</span>
            </label>
          </div>
        </div>

        <div className="stats-modal-footer">
          <button className="word-btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="word-btn-primary btn-sm" onClick={handleSave}>
            Apply Header & Footer
          </button>
        </div>
      </div>
    </div>
  );
};

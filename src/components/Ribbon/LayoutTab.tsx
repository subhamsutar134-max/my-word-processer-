import React from 'react';
import {
  LayoutTemplate,
  Ratio,
} from 'lucide-react';
import type { DocumentSettings, MarginPreset, PageSize } from '../../types/document';

interface LayoutTabProps {
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ settings, onUpdateSettings }) => {
  return (
    <div className="word-ribbon-tab-content">
      {/* Group 1: Margins */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items font-grid">
          <div className="word-ribbon-subrow">
            <label className="word-select-label">Margins:</label>
            <select
              className="word-select"
              value={settings.margin}
              onChange={(e) => onUpdateSettings({ margin: e.target.value as MarginPreset })}
            >
              <option value="normal">Normal (1.0 in)</option>
              <option value="narrow">Narrow (0.5 in)</option>
              <option value="moderate">Moderate (0.75 in)</option>
              <option value="wide">Wide (1.25 in)</option>
            </select>
          </div>
          <div className="word-ribbon-subrow text-muted-small">
            <span>Top/Bottom/Left/Right: {settings.margin === 'narrow' ? '0.5"' : settings.margin === 'wide' ? '1.25"' : '1.0"'}</span>
          </div>
        </div>
        <div className="word-ribbon-group-label">Margins</div>
      </div>

      {/* Group 2: Orientation */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className={`word-ribbon-tool-btn ${settings.orientation === 'portrait' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ orientation: 'portrait' })}
            title="Portrait Page Orientation"
          >
            <Ratio size={18} />
            <span className="btn-label-small">Portrait</span>
          </button>
          <button
            className={`word-ribbon-tool-btn ${settings.orientation === 'landscape' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ orientation: 'landscape' })}
            title="Landscape Page Orientation"
          >
            <LayoutTemplate size={18} />
            <span className="btn-label-small">Landscape</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Orientation</div>
      </div>

      {/* Group 3: Paper Size */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items font-grid">
          <div className="word-ribbon-subrow">
            <label className="word-select-label">Paper Size:</label>
            <select
              className="word-select"
              value={settings.size}
              onChange={(e) => onUpdateSettings({ size: e.target.value as PageSize })}
            >
              <option value="letter">Letter (8.5" × 11")</option>
              <option value="a4">A4 (210 × 297 mm)</option>
              <option value="legal">Legal (8.5" × 14")</option>
            </select>
          </div>
          <div className="word-ribbon-subrow text-muted-small">
            <span>Standard printing layout</span>
          </div>
        </div>
        <div className="word-ribbon-group-label">Page Setup</div>
      </div>

      {/* Group 4: Page Theme */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className={`word-ribbon-tool-btn ${settings.pageTheme === 'white' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ pageTheme: 'white' })}
            title="Default White Paper"
          >
            <div className="theme-swatch white" />
            <span className="btn-label-small">White</span>
          </button>
          <button
            className={`word-ribbon-tool-btn ${settings.pageTheme === 'sepia' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ pageTheme: 'sepia' })}
            title="Warm Sepia Reading Paper"
          >
            <div className="theme-swatch sepia" />
            <span className="btn-label-small">Sepia</span>
          </button>
          <button
            className={`word-ribbon-tool-btn ${settings.pageTheme === 'dark' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ pageTheme: 'dark' })}
            title="Dark Mode Document Paper"
          >
            <div className="theme-swatch dark" />
            <span className="btn-label-small">Dark</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Page Color</div>
      </div>
    </div>
  );
};

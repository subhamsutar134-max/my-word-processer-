import React from 'react';
import {
  FileText,
  Globe,
  Ruler,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hash,
} from 'lucide-react';
import type { DocumentSettings } from '../../types/document';

interface ViewTabProps {
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

export const ViewTab: React.FC<ViewTabProps> = ({
  settings,
  onUpdateSettings,
  zoom,
  onZoomChange,
}) => {
  return (
    <div className="word-ribbon-tab-content">
      {/* Group 1: Views */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className={`word-ribbon-tool-btn ${settings.viewMode === 'print' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'print' })}
            title="Print Layout (Realistic A4 / Letter Page Card)"
          >
            <FileText size={18} />
            <span className="btn-label-small">Print Layout</span>
          </button>
          <button
            className={`word-ribbon-tool-btn ${settings.viewMode === 'web' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'web' })}
            title="Web Layout (Responsive fluid canvas)"
          >
            <Globe size={18} />
            <span className="btn-label-small">Web Layout</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Views</div>
      </div>

      {/* Group 2: Show */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items vertical-stack">
          <label className="word-checkbox-label">
            <input
              type="checkbox"
              checked={settings.showRuler}
              onChange={(e) => onUpdateSettings({ showRuler: e.target.checked })}
            />
            <Ruler size={14} />
            <span>Ruler</span>
          </label>
          <label className="word-checkbox-label">
            <input
              type="checkbox"
              checked={settings.showPageNumbers}
              onChange={(e) => onUpdateSettings({ showPageNumbers: e.target.checked })}
            />
            <Hash size={14} />
            <span>Page Numbers</span>
          </label>
        </div>
        <div className="word-ribbon-group-label">Show</div>
      </div>

      {/* Group 3: Zoom */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            onClick={() => onZoomChange(100)}
            title="Reset Zoom to 100%"
          >
            <span className="zoom-number-badge">100%</span>
            <span className="btn-label-small">100%</span>
          </button>
          <button
            className="word-ribbon-tool-btn"
            onClick={() => onZoomChange(125)}
            title="Fit to Page Width"
          >
            <Maximize size={18} />
            <span className="btn-label-small">Page Width</span>
          </button>
          <div className="vertical-stack">
            <button
              className="word-ribbon-compact-btn"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              title="Zoom In"
            >
              <ZoomIn size={14} />
              <span>Zoom In</span>
            </button>
            <button
              className="word-ribbon-compact-btn"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
              <span>Zoom Out</span>
            </button>
          </div>
        </div>
        <div className="word-ribbon-group-label">Zoom</div>
      </div>
    </div>
  );
};

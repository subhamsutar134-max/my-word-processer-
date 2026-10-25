import React from 'react';
import {
  FileText,
  Globe,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import type { DocumentSettings } from '../../types/document';

interface StatusBarProps {
  pageCount: number;
  wordCount: number;
  characterCount: number;
  isSaving: boolean;
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onOpenStatistics: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  pageCount,
  wordCount,
  characterCount,
  isSaving,
  settings,
  onUpdateSettings,
  zoom,
  onZoomChange,
  onOpenStatistics,
}) => {
  return (
    <footer className="word-statusbar" role="contentinfo">
      {/* Left Telemetry */}
      <div className="word-statusbar-left">
        <button
          className="statusbar-item-btn"
          onClick={onOpenStatistics}
          title="Document pagination"
        >
          <span>Page 1 of {pageCount}</span>
        </button>

        <span className="statusbar-divider">|</span>

        <button
          className="statusbar-item-btn"
          onClick={onOpenStatistics}
          title="Click to view detailed word count statistics"
        >
          <span>{wordCount.toLocaleString()} words</span>
        </button>

        <span className="statusbar-divider">|</span>

        <button
          className="statusbar-item-btn"
          onClick={onOpenStatistics}
          title="Character count"
        >
          <span>{characterCount.toLocaleString()} characters</span>
        </button>

        <span className="statusbar-divider">|</span>

        <div className="statusbar-item-static" title="Proofing Language">
          <span>English (US)</span>
        </div>

        <span className="statusbar-divider">|</span>

        <div className="statusbar-item-static" title="Local Storage Status">
          <CheckCircle2 size={13} className="text-success" />
          <span>{isSaving ? 'Autosaving...' : 'Saved to Local Vault'}</span>
        </div>
      </div>

      {/* Right Controls: Views & Zoom Slider */}
      <div className="word-statusbar-right">
        {/* Layout Modes */}
        <div className="statusbar-views">
          <button
            className={`statusbar-view-btn ${settings.viewMode === 'print' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'print' })}
            title="Print Layout (Letter/A4 Page Card)"
          >
            <FileText size={14} />
          </button>
          <button
            className={`statusbar-view-btn ${settings.viewMode === 'web' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'web' })}
            title="Web Layout (Full-width fluid flow)"
          >
            <Globe size={14} />
          </button>
        </div>

        <span className="statusbar-divider">|</span>

        {/* Zoom Controls */}
        <div className="statusbar-zoom">
          <button
            className="zoom-step-btn"
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            title="Zoom Out"
            disabled={zoom <= 50}
          >
            <Minus size={12} />
          </button>

          <input
            type="range"
            min={50}
            max={200}
            step={5}
            value={zoom}
            onChange={(e) => onZoomChange(parseInt(e.target.value, 10))}
            className="zoom-slider"
            title={`Zoom: ${zoom}%`}
          />

          <button
            className="zoom-step-btn"
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            title="Zoom In"
            disabled={zoom >= 200}
          >
            <Plus size={12} />
          </button>

          <button
            className="zoom-percent-btn"
            onClick={() => onZoomChange(100)}
            title="Click to reset zoom to 100%"
          >
            {zoom}%
          </button>
        </div>
      </div>
    </footer>
  );
};

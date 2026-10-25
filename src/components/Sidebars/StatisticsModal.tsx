import React from 'react';
import { X, FileSpreadsheet, Clock, Mic } from 'lucide-react';
import type { DocumentStatistics } from '../../utils/statistics';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DocumentStatistics;
  pageCount: number;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  stats,
  pageCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="word-modal-backdrop" onClick={onClose}>
      <div className="word-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <div className="stats-title-row">
            <FileSpreadsheet size={16} className="text-primary" />
            <h3>Word Count Statistics</h3>
          </div>
          <button className="stats-close-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="stats-modal-body">
          <table className="stats-table">
            <tbody>
              <tr>
                <td className="stat-label">Pages:</td>
                <td className="stat-val">{pageCount}</td>
              </tr>
              <tr>
                <td className="stat-label">Words:</td>
                <td className="stat-val">{stats.words.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="stat-label">Characters (no spaces):</td>
                <td className="stat-val">{stats.charactersNoSpaces.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="stat-label">Characters (with spaces):</td>
                <td className="stat-val">{stats.characters.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="stat-label">Paragraphs:</td>
                <td className="stat-val">{stats.paragraphs.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="stat-label">Sentences:</td>
                <td className="stat-val">{stats.sentences.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="stats-readability-box">
            <div className="readability-metric">
              <Clock size={14} className="text-muted" />
              <span>Reading Time: <strong>~{stats.readingTimeMinutes} min</strong></span>
            </div>
            <div className="readability-metric">
              <Mic size={14} className="text-muted" />
              <span>Speaking Time: <strong>~{stats.speakingTimeMinutes} min</strong></span>
            </div>
          </div>
        </div>

        <div className="stats-modal-footer">
          <button className="word-btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

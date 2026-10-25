import React, { useState } from 'react';
import { X, History, RotateCcw, Clock, Plus } from 'lucide-react';
import type { RevisionSnapshot } from '../../types/document';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: RevisionSnapshot[];
  onRestoreRevision: (snapshot: RevisionSnapshot) => void;
  onCreateSnapshot: (label?: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  revisions,
  onRestoreRevision,
  onCreateSnapshot,
}) => {
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState<RevisionSnapshot | null>(
    revisions[0] || null
  );

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSnapshot(snapshotLabel.trim() || undefined);
    setSnapshotLabel('');
  };

  return (
    <div className="word-modal-backdrop" onClick={onClose}>
      <div className="word-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <div className="stats-title-row">
            <History size={16} className="text-primary" />
            <h3>Version History & Recovery Snapshots</h3>
          </div>
          <button className="stats-close-btn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="history-modal-body">
          {/* Left: Snapshots Timeline */}
          <div className="history-timeline-panel">
            <form className="history-create-form" onSubmit={handleCreate}>
              <input
                type="text"
                className="fr-text-input text-sm"
                placeholder="Name snapshot (e.g. Before edit)..."
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
              />
              <button type="submit" className="word-btn-secondary btn-sm">
                <Plus size={13} />
                <span>Save Snapshot</span>
              </button>
            </form>

            <div className="history-snapshots-list">
              {revisions.length === 0 ? (
                <div className="history-empty">
                  <Clock size={24} className="text-muted" />
                  <p>No previous snapshots saved for this document.</p>
                </div>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className={`history-snapshot-item ${selectedSnapshot?.id === rev.id ? 'active' : ''}`}
                    onClick={() => setSelectedSnapshot(rev)}
                  >
                    <div className="snapshot-time">
                      {new Date(rev.timestamp).toLocaleString()}
                    </div>
                    <div className="snapshot-title">{rev.title}</div>
                    <div className="snapshot-meta">{rev.wordCount} words</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Snapshot Preview & Restore */}
          <div className="history-preview-panel">
            {selectedSnapshot ? (
              <>
                <div className="history-preview-header">
                  <div>
                    <h4>{selectedSnapshot.title}</h4>
                    <span className="text-muted-small">
                      Snapshot taken on {new Date(selectedSnapshot.timestamp).toLocaleString()} • {selectedSnapshot.wordCount} words
                    </span>
                  </div>
                  <button
                    className="word-btn-primary btn-sm"
                    onClick={() => {
                      if (window.confirm('Restore document to this version? Current unsaved changes will be replaced.')) {
                        onRestoreRevision(selectedSnapshot);
                        onClose();
                      }
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Restore Version</span>
                  </button>
                </div>

                <div
                  className="history-preview-content"
                  dangerouslySetInnerHTML={{ __html: selectedSnapshot.contentHtml }}
                />
              </>
            ) : (
              <div className="history-no-preview">
                <p>Select a snapshot from the timeline to preview its contents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

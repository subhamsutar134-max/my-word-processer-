import React from 'react';
import {
  FileSpreadsheet,
  CheckCheck,
  MessageSquare,
  MessageSquarePlus,
  GitBranch,
  Languages,
} from 'lucide-react';

interface ReviewTabProps {
  onOpenStatistics: () => void;
  onOpenComments: () => void;
  onAddComment: () => void;
  isTrackingEnabled: boolean;
  onToggleTrackChanges: () => void;
  commentCount: number;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  onOpenStatistics,
  onOpenComments,
  onAddComment,
  isTrackingEnabled,
  onToggleTrackChanges,
  commentCount,
}) => {
  return (
    <div className="word-ribbon-tab-content">
      {/* Group 1: Proofing */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            onClick={onOpenStatistics}
            title="Word Count & Readability Statistics"
          >
            <FileSpreadsheet size={18} />
            <span className="btn-label-small">Word Count</span>
          </button>
          <button
            className="word-ribbon-tool-btn active"
            title="Spelling and Grammar Check (Active)"
          >
            <CheckCheck size={18} />
            <span className="btn-label-small">Spelling</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Proofing</div>
      </div>

      {/* Group 2: Language */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            title="Proofing Language: English (US)"
          >
            <Languages size={18} />
            <span className="btn-label-small">Language</span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Language</div>
      </div>

      {/* Group 3: Comments */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className="word-ribbon-tool-btn"
            onClick={onAddComment}
            title="New Comment on current selection"
          >
            <MessageSquarePlus size={18} />
            <span className="btn-label-small">New Comment</span>
          </button>
          <button
            className="word-ribbon-tool-btn"
            onClick={onOpenComments}
            title="Show or hide comments pane"
          >
            <MessageSquare size={18} />
            <span className="btn-label-small">
              Comments {commentCount > 0 ? `(${commentCount})` : ''}
            </span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Comments</div>
      </div>

      {/* Group 4: Tracking */}
      <div className="word-ribbon-group">
        <div className="word-ribbon-group-items">
          <button
            className={`word-ribbon-tool-btn ${isTrackingEnabled ? 'active tracking-active' : ''}`}
            onClick={onToggleTrackChanges}
            title="Track changes made to this document"
          >
            <GitBranch size={18} />
            <span className="btn-label-small">
              {isTrackingEnabled ? 'Tracking ON' : 'Track Changes'}
            </span>
          </button>
        </div>
        <div className="word-ribbon-group-label">Tracking</div>
      </div>
    </div>
  );
};

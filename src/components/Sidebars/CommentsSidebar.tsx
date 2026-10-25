import React, { useState } from 'react';
import { X, MessageSquare, Check, Trash2, Send, CornerDownRight } from 'lucide-react';
import type { CommentItem } from '../../types/document';

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  comments: CommentItem[];
  onAddComment: (text: string, selectedText?: string) => void;
  onToggleResolve: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({
  isOpen,
  onClose,
  comments,
  onAddComment,
  onToggleResolve,
  onDeleteComment,
}) => {
  const [newCommentText, setNewCommentText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      onAddComment(newCommentText.trim());
      setNewCommentText('');
    }
  };

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  return (
    <aside className="word-comments-sidebar" aria-label="Review comments pane">
      <div className="comments-sidebar-header">
        <div className="header-title-row">
          <MessageSquare size={16} className="text-primary" />
          <h2>Comments ({comments.length})</h2>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} title="Close Comments">
          <X size={16} />
        </button>
      </div>

      {/* New Comment Input Box */}
      <form className="comment-compose-box" onSubmit={handleSubmit}>
        <textarea
          className="comment-textarea"
          placeholder="Add a comment or feedback..."
          rows={2}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
        />
        <div className="comment-compose-actions">
          <button
            type="submit"
            className="word-btn-primary btn-sm"
            disabled={!newCommentText.trim()}
          >
            <Send size={13} />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-scroll-list">
        {comments.length === 0 ? (
          <div className="comments-empty">
            <MessageSquare size={32} className="text-muted" />
            <p>No comments in this document yet.</p>
            <span className="text-muted-small">Select any text in the editor and click "New Comment".</span>
          </div>
        ) : (
          <>
            {activeComments.map((comment) => (
              <div key={comment.id} className="comment-card active">
                <div className="comment-card-header">
                  <div className="author-info">
                    <div
                      className="author-avatar"
                      style={{ backgroundColor: comment.avatarColor || '#185abd' }}
                    >
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="author-name">{comment.author}</span>
                  </div>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {comment.selectedText && (
                  <div className="comment-anchor-quote">
                    <CornerDownRight size={12} />
                    <span>"{comment.selectedText}"</span>
                  </div>
                )}

                <div className="comment-body">{comment.text}</div>

                <div className="comment-card-footer">
                  <button
                    className="comment-action-btn resolve"
                    onClick={() => onToggleResolve(comment.id)}
                    title="Mark comment as resolved"
                  >
                    <Check size={13} />
                    <span>Resolve</span>
                  </button>
                  <button
                    className="comment-action-btn delete"
                    onClick={() => onDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {resolvedComments.length > 0 && (
              <div className="resolved-section">
                <div className="resolved-header">Resolved ({resolvedComments.length})</div>
                {resolvedComments.map((comment) => (
                  <div key={comment.id} className="comment-card resolved">
                    <div className="comment-card-header">
                      <span className="author-name">{comment.author}</span>
                      <button
                        className="comment-action-btn unresolve"
                        onClick={() => onToggleResolve(comment.id)}
                      >
                        Reopen
                      </button>
                    </div>
                    <div className="comment-body resolved-text">{comment.text}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

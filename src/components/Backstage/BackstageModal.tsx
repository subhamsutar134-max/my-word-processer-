import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Printer,
  Info,
  Trash2,
  Upload,
  FileText,
  FileCode,
  FileArchive,
} from 'lucide-react';
import type { DocumentData, DocumentMetadata } from '../../types/document';
import { saveAs } from 'file-saver';

interface BackstageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoc: DocumentData;
  recentDocs: DocumentMetadata[];
  onOpenDoc: (id: string) => void;
  onNewDoc: (templateHtml?: string, title?: string) => void;
  onDeleteDoc: (id: string) => void;
  onImportDocx: (file: File) => void;
  onExportDocx: () => void;
  onPrint: () => void;
}

type BackstageSection = 'info' | 'new' | 'open' | 'saveAs' | 'export' | 'print';

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank Document',
    description: 'Start fresh with a clean, blank slate.',
    html: '<p></p>',
  },
  {
    id: 'report',
    title: 'Executive Project Report',
    description: 'Comprehensive business proposal with headings, tables, and metrics.',
    html: `
      <h1><strong>Quarterly Strategic Performance Report</strong></h1>
      <p style="color: #666;"><em>Executive Board Review | Prepared by Operations & Strategy</em></p>
      <hr />
      <h2><strong>1. Executive Summary</strong></h2>
      <p>During the past quarter, key initiatives demonstrated an overall efficiency growth of <strong>+24.8%</strong> across primary operational sectors. Capital allocation remained optimized while resource throughput exceeded projected baselines.</p>
      <h2><strong>2. Performance KPI Matrix</strong></h2>
      <table>
        <thead>
          <tr>
            <th><strong>Objective</strong></th>
            <th><strong>Target</strong></th>
            <th><strong>Actual</strong></th>
            <th><strong>Variance</strong></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Revenue Growth</td>
            <td>15.0%</td>
            <td>18.4%</td>
            <td>+3.4%</td>
          </tr>
          <tr>
            <td>Operational Overhead</td>
            <td>-5.0%</td>
            <td>-7.2%</td>
            <td>+2.2%</td>
          </tr>
          <tr>
            <td>Client Satisfaction</td>
            <td>92.0%</td>
            <td>96.5%</td>
            <td>+4.5%</td>
          </tr>
        </tbody>
      </table>
      <h2><strong>3. Strategic Next Steps</strong></h2>
      <ul>
        <li>Finalize enterprise cloud infrastructure migration by end of month.</li>
        <li>Expand developer productivity toolchains across cross-functional squads.</li>
        <li>Review feedback gathered from initial stakeholder testing.</li>
      </ul>
    `,
  },
  {
    id: 'memo',
    title: 'Formal Business Letter',
    description: 'Standard business correspondence format with sender and recipient headers.',
    html: `
      <p style="text-align: right; color: #555;">October 25, 2026</p>
      <p><strong>To:</strong> Dr. Evelyn Vance<br />Chief Technology Officer<br />Global Horizons Corporation</p>
      <p><strong>From:</strong> Engineering Leadership Team</p>
      <p><strong>Subject:</strong> Formal Approval — Core Platform Modernization</p>
      <hr />
      <p>Dear Dr. Vance,</p>
      <p>We are pleased to submit the final architecture report for the core platform modernization program. Following comprehensive benchmarking, the technical working group unanimously recommends proceeding with the clean-room application architecture.</p>
      <p>Key highlights of the proposed approach include deterministic state preservation, real-time revision tracking, and seamless document interchange across OpenXML and PDF formats.</p>
      <p>Please review the enclosed deliverables. We look forward to discussing the implementation roadmap during Monday's executive briefing.</p>
      <p>Sincerely,</p>
      <p><strong>The Engineering Leadership Team</strong></p>
    `,
  },
  {
    id: 'meeting',
    title: 'Meeting Notes & Actions',
    description: 'Structured agenda, discussion notes, and actionable task checklists.',
    html: `
      <h1><strong>Architecture Review & Sprint Planning</strong></h1>
      <p style="color: #666;"><strong>Date:</strong> October 25, 2026 | <strong>Facilitator:</strong> Lead Architect</p>
      <hr />
      <h2><strong>Attendees</strong></h2>
      <p>Lead Architect, Systems Engineer, UI/UX Designer, Product Manager, QA Specialist</p>
      <h2><strong>Discussion Points</strong></h2>
      <ul>
        <li>Evaluated Word OpenXML document parsing and TipTap schema interoperability.</li>
        <li>Validated IndexedDB persistence with automated snapshot intervals.</li>
        <li>Reviewed typographic hierarchy: Calibri, Arial, Segoe UI, and line height settings.</li>
      </ul>
      <h2><strong>Action Items</strong></h2>
      <ul data-type="taskList">
        <li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div>Deploy responsive Fluent ribbon toolbar with Home, Insert, Layout tabs</div></li>
        <li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div>Integrate native DOCX generator with styling and tables</div></li>
        <li data-checked="false"><label><input type="checkbox"><span></span></label><div>Conduct cross-browser print and PDF export verification</div></li>
      </ul>
    `,
  },
];

export const BackstageModal: React.FC<BackstageModalProps> = ({
  isOpen,
  onClose,
  currentDoc,
  recentDocs,
  onOpenDoc,
  onNewDoc,
  onDeleteDoc,
  onImportDocx,
  onExportDocx,
  onPrint,
}) => {
  const [activeSection, setActiveSection] = useState<BackstageSection>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportTxt = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentDoc.contentHtml, 'text/html');
    const text = doc.body.textContent || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${currentDoc.title}.txt`);
  };

  const handleExportHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentDoc.title}</title>
  <style>
    body { font-family: Calibri, 'Segoe UI', sans-serif; margin: 40px auto; max-width: 800px; line-height: 1.5; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f4; }
    blockquote { border-left: 4px solid #185abd; padding-left: 16px; margin: 16px 0; color: #555; }
  </style>
</head>
<body>
  ${currentDoc.contentHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${currentDoc.title}.html`);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(currentDoc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `${currentDoc.title}.json`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDocx(file);
      onClose();
    }
  };

  return (
    <div className="word-backstage-overlay" role="dialog" aria-modal="true">
      {/* Left Backstage Sidebar */}
      <aside className="word-backstage-sidebar">
        <button className="backstage-back-btn" onClick={onClose} title="Return to Document">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="backstage-nav-list">
          <button
            className={`backstage-nav-item ${activeSection === 'info' ? 'active' : ''}`}
            onClick={() => setActiveSection('info')}
          >
            <Info size={16} />
            <span>Info</span>
          </button>

          <button
            className={`backstage-nav-item ${activeSection === 'new' ? 'active' : ''}`}
            onClick={() => setActiveSection('new')}
          >
            <FilePlus size={16} />
            <span>New</span>
          </button>

          <button
            className={`backstage-nav-item ${activeSection === 'open' ? 'active' : ''}`}
            onClick={() => setActiveSection('open')}
          >
            <FolderOpen size={16} />
            <span>Open</span>
          </button>

          <button
            className={`backstage-nav-item ${activeSection === 'saveAs' ? 'active' : ''}`}
            onClick={() => setActiveSection('saveAs')}
          >
            <Save size={16} />
            <span>Save As</span>
          </button>

          <button
            className={`backstage-nav-item ${activeSection === 'print' ? 'active' : ''}`}
            onClick={() => {
              onClose();
              onPrint();
            }}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button
            className={`backstage-nav-item ${activeSection === 'export' ? 'active' : ''}`}
            onClick={() => setActiveSection('export')}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </aside>

      {/* Main Backstage Stage */}
      <main className="word-backstage-content">
        {/* SECTION: INFO */}
        {activeSection === 'info' && (
          <div className="backstage-panel">
            <h1 className="backstage-heading">Document Information</h1>
            <div className="backstage-info-grid">
              <div className="info-card-main">
                <div className="info-doc-icon-large">
                  <span className="word-icon-letter">W</span>
                </div>
                <h2>{currentDoc.title}</h2>
                <p className="text-muted">Microsoft Word Document (.docx compatible)</p>

                <div className="info-actions-row">
                  <button className="word-btn-primary" onClick={onExportDocx}>
                    <Download size={15} />
                    <span>Download DOCX</span>
                  </button>
                  <button className="word-btn-secondary" onClick={onPrint}>
                    <Printer size={15} />
                    <span>Print Document</span>
                  </button>
                </div>
              </div>

              <div className="info-properties-card">
                <h3>Properties</h3>
                <div className="prop-row">
                  <span className="prop-label">Word Count:</span>
                  <span className="prop-val">{currentDoc.wordCount} words</span>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Character Count:</span>
                  <span className="prop-val">{currentDoc.characterCount} characters</span>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Page Setup:</span>
                  <span className="prop-val">
                    {currentDoc.settings.size.toUpperCase()} | {currentDoc.settings.orientation} | {currentDoc.settings.margin} margins
                  </span>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Created:</span>
                  <span className="prop-val">{new Date(currentDoc.createdAt).toLocaleString()}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Last Modified:</span>
                  <span className="prop-val">{new Date(currentDoc.updatedAt).toLocaleString()}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Storage:</span>
                  <span className="prop-val">Local IndexedDB Vault (Offline)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: NEW */}
        {activeSection === 'new' && (
          <div className="backstage-panel">
            <h1 className="backstage-heading">New Document</h1>
            <p className="backstage-subhead">Select a template or start with a clean page.</p>

            <div className="templates-grid">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="template-card"
                  onClick={() => {
                    onNewDoc(tmpl.html, tmpl.title);
                    onClose();
                  }}
                >
                  <div className="template-preview-thumbnail">
                    <div className="template-sheet">
                      <div className="sheet-line h1" />
                      <div className="sheet-line" />
                      <div className="sheet-line" />
                      <div className="sheet-line short" />
                    </div>
                  </div>
                  <div className="template-card-body">
                    <h3>{tmpl.title}</h3>
                    <p>{tmpl.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: OPEN */}
        {activeSection === 'open' && (
          <div className="backstage-panel">
            <div className="backstage-header-row">
              <div>
                <h1 className="backstage-heading">Open Document</h1>
                <p className="backstage-subhead">Recent documents saved on this machine or upload an existing DOCX file.</p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  className="word-btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>Import DOCX File</span>
                </button>
              </div>
            </div>

            <div className="recent-docs-list">
              {recentDocs.length === 0 ? (
                <div className="empty-recent-state">
                  <FolderOpen size={36} className="text-muted" />
                  <p>No other documents found in local storage.</p>
                </div>
              ) : (
                recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`recent-doc-row ${doc.id === currentDoc.id ? 'current' : ''}`}
                  >
                    <div
                      className="recent-doc-info"
                      onClick={() => {
                        onOpenDoc(doc.id);
                        onClose();
                      }}
                    >
                      <div className="doc-icon-small">W</div>
                      <div className="recent-doc-texts">
                        <span className="recent-doc-title">
                          {doc.title}
                          {doc.id === currentDoc.id && <span className="current-badge">Active</span>}
                        </span>
                        <span className="recent-doc-meta">
                          {doc.wordCount} words • Last updated {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="recent-doc-actions">
                      <button
                        className="recent-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete document "${doc.title}"?`)) {
                            onDeleteDoc(doc.id);
                          }
                        }}
                        title="Delete document"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION: SAVE AS & EXPORT */}
        {(activeSection === 'saveAs' || activeSection === 'export') && (
          <div className="backstage-panel">
            <h1 className="backstage-heading">Export & Save As</h1>
            <p className="backstage-subhead">Export to standard formats for publishing, distribution, and archiving.</p>

            <div className="export-options-grid">
              <div className="export-option-card" onClick={onExportDocx}>
                <div className="export-icon docx">
                  <FileText size={24} />
                </div>
                <div className="export-text">
                  <h3>Microsoft Word Document (.docx)</h3>
                  <p>OpenXML format with standard margins, headings, tables, and typography.</p>
                </div>
                <button className="export-action-btn">Download</button>
              </div>

              <div
                className="export-option-card"
                onClick={() => {
                  onClose();
                  onPrint();
                }}
              >
                <div className="export-icon pdf">
                  <Printer size={24} />
                </div>
                <div className="export-text">
                  <h3>Print / Save to PDF (.pdf)</h3>
                  <p>High-resolution vector printable document formatted according to your page layout.</p>
                </div>
                <button className="export-action-btn">Print / PDF</button>
              </div>

              <div className="export-option-card" onClick={handleExportTxt}>
                <div className="export-icon txt">
                  <FileText size={24} />
                </div>
                <div className="export-text">
                  <h3>Plain Text (.txt)</h3>
                  <p>Unformatted text document containing only raw characters without styling.</p>
                </div>
                <button className="export-action-btn">Download</button>
              </div>

              <div className="export-option-card" onClick={handleExportHtml}>
                <div className="export-icon html">
                  <FileCode size={24} />
                </div>
                <div className="export-text">
                  <h3>Web Page (.html)</h3>
                  <p>Standard standalone HTML page with embedded styling.</p>
                </div>
                <button className="export-action-btn">Download</button>
              </div>

              <div className="export-option-card" onClick={handleExportJson}>
                <div className="export-icon json">
                  <FileArchive size={24} />
                </div>
                <div className="export-text">
                  <h3>Document Snapshot (.json)</h3>
                  <p>Complete document state including metadata, comments, and settings for backup.</p>
                </div>
                <button className="export-action-btn">Backup JSON</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

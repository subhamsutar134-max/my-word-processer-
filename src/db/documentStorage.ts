import type { DocumentData, DocumentMetadata, RevisionSnapshot } from '../types/document';

const DB_NAME = 'WordProcessorDB';
const DB_VERSION = 1;
const STORE_DOCS = 'documents';
const STORE_REVISIONS = 'revisions';
const STORE_META = 'metadata';

const SAMPLE_DOCUMENT_HTML = `
<h1><strong>Annual Project & Strategy Report</strong></h1>
<p style="color: #555555; font-size: 11pt;"><em>Prepared by the Engineering & Architecture Team | Confidential</em></p>
<hr />
<h2><strong>1. Executive Overview</strong></h2>
<p>Welcome to <strong>Microsoft Word Rebuilt</strong>, a high-performance word processor built from clean-room architecture. This document illustrates standard typography, paragraph alignment, styling, and table formatting compatible with modern word processing standards.</p>
<p>Key highlights of this release include:</p>
<ul>
  <li><strong>Full Typography Engine:</strong> Custom font families, responsive sizing, weights, colors, and line spacing.</li>
  <li><strong>Document Structure:</strong> Headings (H1–H3), blockquotes, lists, tables, and page break mechanics.</li>
  <li><strong>Interoperability:</strong> Native <code>.docx</code> import and export, plain text, and PDF rendering.</li>
  <li><strong>Productivity:</strong> Autosave with IndexedDB local storage, find & replace, comments, and revision history.</li>
</ul>

<h2><strong>2. Comparative Performance Metrics</strong></h2>
<p>The table below summarizes performance across key document editing workflows:</p>
<table>
  <thead>
    <tr>
      <th><strong>Capability</strong></th>
      <th><strong>Status</strong></th>
      <th><strong>Latency / Target</strong></th>
      <th><strong>Storage Engine</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Rich Text Input</td>
      <td>Real-time</td>
      <td>&lt; 8ms typing latency</td>
      <td>ProseMirror State</td>
    </tr>
    <tr>
      <td>Autosave Persistence</td>
      <td>Active</td>
      <td>Debounced 1500ms</td>
      <td>IndexedDB Vault</td>
    </tr>
    <tr>
      <td>DOCX Export</td>
      <td>Operational</td>
      <td>ECMA-376 OpenXML</td>
      <td>Native Generator</td>
    </tr>
    <tr>
      <td>Printing & PDF</td>
      <td>Vector Quality</td>
      <td>High-resolution @media print</td>
      <td>Browser Engine</td>
    </tr>
  </tbody>
</table>

<h2><strong>3. Collaborative Features & Review</strong></h2>
<blockquote><p>"Precision in document formatting enables teams to communicate complex technical ideas with clarity and authority."</p></blockquote>
<p>Use the <strong>Review</strong> tab to add comments to any selected text, monitor word and character counts, or toggle track changes. On the <strong>Layout</strong> tab, you can adjust page margins, orientation, and sizes.</p>
`;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        const docStore = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_REVISIONS)) {
        const revStore = db.createObjectStore(STORE_REVISIONS, { keyPath: 'id' });
        revStore.createIndex('documentId', 'documentId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocument(doc: DocumentData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DOCS, STORE_META], 'readwrite');
    const docStore = tx.objectStore(STORE_DOCS);
    const metaStore = tx.objectStore(STORE_META);

    docStore.put(doc);
    metaStore.put({ key: 'lastOpenedDocId', value: doc.id });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDocument(id: string): Promise<DocumentData | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readonly');
    const store = tx.objectStore(STORE_DOCS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function listDocuments(): Promise<DocumentMetadata[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readonly');
    const store = tx.objectStore(STORE_DOCS);
    const request = store.getAll();

    request.onsuccess = () => {
      const docs: DocumentData[] = request.result || [];
      // strip large HTML content for list view
      const list = docs.map(({ contentHtml, ...meta }) => meta as DocumentMetadata);
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(list);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DOCS, STORE_REVISIONS], 'readwrite');
    tx.objectStore(STORE_DOCS).delete(id);
    
    // delete related revisions
    const revIndex = tx.objectStore(STORE_REVISIONS).index('documentId');
    const revReq = revIndex.getAllKeys(id);
    revReq.onsuccess = () => {
      const keys = revReq.result;
      const revStore = tx.objectStore(STORE_REVISIONS);
      keys.forEach((k) => revStore.delete(k));
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveRevision(snapshot: RevisionSnapshot): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REVISIONS, 'readwrite');
    tx.objectStore(STORE_REVISIONS).put(snapshot);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRevisions(documentId: string): Promise<RevisionSnapshot[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REVISIONS, 'readonly');
    const index = tx.objectStore(STORE_REVISIONS).index('documentId');
    const request = index.getAll(documentId);

    request.onsuccess = () => {
      const items: RevisionSnapshot[] = request.result || [];
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getLastOpenedDocumentId(): Promise<string | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const request = tx.objectStore(STORE_META).get('lastOpenedDocId');
    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => reject(request.error);
  });
}

export function createDefaultDocument(title = 'Document 1'): DocumentData {
  return {
    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: 168,
    characterCount: 1140,
    contentHtml: SAMPLE_DOCUMENT_HTML,
    isTrackingEnabled: false,
    settings: {
      margin: 'normal',
      orientation: 'portrait',
      size: 'letter',
      headerText: 'Microsoft Word Document',
      footerText: 'Page 1',
      showPageNumbers: true,
      showRuler: true,
      viewMode: 'print',
      pageTheme: 'white',
    },
    comments: [
      {
        id: 'c1',
        author: 'Lead Reviewer',
        avatarColor: '#185abd',
        text: 'The OpenXML export schema is verified and compliant with ISO/IEC 29500.',
        createdAt: Date.now() - 3600000,
        resolved: false,
        selectedText: 'ECMA-376 OpenXML',
      },
    ],
    trackChanges: [],
  };
}

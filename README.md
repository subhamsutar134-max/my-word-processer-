# Microsoft Word Web Application

A full-featured, clean-room modern Word Processor web application inspired by Microsoft Word's architectural design, OpenXML format specifications, and Fluent UI paradigm.

Built from scratch using React 19, TypeScript, Vite, TipTap/ProseMirror, IndexedDB, and OpenXML standards.

---

## 🚀 Features

### 1. Document Canvas & Paginated Layout
- **True Page Simulation:** Authentic Letter/A4 canvas with drop shadows, page break boundaries, and margins.
- **Dynamic Interactive Ruler:** Draggable margin guidelines (left & right margins) with inch markings.
- **Header & Footer Engine:** Customizable top and bottom page metadata, date insertion, and page numbering.
- **Page Layout Customization:**
  - **Margins:** Normal (1 in), Narrow (0.5 in), Moderate (0.75 in), Wide (1.5 in).
  - **Orientation:** Portrait & Landscape.
  - **Paper Sizes:** Letter (8.5 × 11"), A4 (210 × 297mm), Legal (8.5 × 14"), Executive (7.25 × 10.5").
  - **Zoom Engine:** Continuous 50% to 200% zoom scaling with real-time CSS transform matrix.

### 2. Comprehensive Rich-Text Editing
- **Typography & Font Styling:**
  - Font Families: Aptos, Calibri, Arial, Times New Roman, Segoe UI, Georgia, Courier New.
  - Font Sizes: 8pt through 72pt with instant preview.
  - Formats: **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~, X₂ Subscript, X² Superscript.
  - Color Picker: Text colors and highlight backgrounds.
- **Paragraph & Block Formatting:**
  - Alignment: Left, Center, Right, Justify.
  - Line Spacing: 1.0, 1.15, 1.5, 2.0, 2.5, 3.0.
  - Indentation: Increase / Decrease indent.
  - Lists: Bulleted, Numbered, and Interactive Checkboxes (Task lists).
  - Headings: Normal text, Heading 1, Heading 2, Heading 3, Heading 4, Blockquote, Code block.
- **Insertables:**
  - Tables: Dynamic row/column insertion, cell background coloring, border controls, delete table.
  - Images: URL insertion and local image uploads.
  - Hyperlinks: Insert and edit active URLs.
  - Page Breaks: Explicit pagination breaks.
  - Horizontal Rules: Visual section dividers.

### 3. File Formats & Compatibility (OpenXML & Import/Export)
- **Export to DOCX:** Generates native OpenXML `.docx` files using `docx` with styling, headers, footers, tables, and headings preserved.
- **Import DOCX:** Converts uploaded `.docx` documents into rich editing state via `mammoth`.
- **Export to HTML:** Download clean, semantic HTML representation.
- **Export to TXT:** Clean plain text extraction.
- **Print & PDF:** Formatted `@media print` stylesheets supporting direct browser PDF printing.

### 4. Backstage Management & Document Vault
- **Office Backstage View (File Tab):**
  - Document Info (Created date, modified date, author, size, word count).
  - New Document from Templates (Blank Document, Project Proposal, Executive Resume, Meeting Notes).
  - Open Recent Documents from local IndexedDB storage.
  - Delete, Duplicate, and Rename documents.
- **Auto-Save Engine:** Non-blocking debounced auto-save to IndexedDB with real-time status indicator in Title Bar and Status Bar.

### 5. Review & Collaboration Tools
- **Threaded Comments:** Select text and attach comments; view, resolve, and delete comments in the Comments sidebar.
- **Track Changes:** Toggleable Track Changes indicator and revision snapshot generator.
- **Version History:** Snapshot history viewer with timestamped checkpoints and 1-click restore.
- **Live Word & Document Statistics:** Real-time calculation of words, characters (with and without spaces), paragraphs, sentences, estimated reading time, and speaking time.
- **Find & Replace:** Full document text search with Case Sensitive, Whole Word matching, and Replace / Replace All.

---

## 🛠️ Technology Architecture

| Layer | Technology | Role |
|---|---|---|
| **Core UI Framework** | React 19 + TypeScript | Component tree & reactive state management |
| **Rich Text Engine** | TipTap / ProseMirror | Headless Document Object Model, transactions & plugins |
| **Build & Toolchain** | Vite 8 + Rolldown | Ultra-fast HMR and optimized production bundle |
| **Local Persistence** | IndexedDB (`idb`-style native) | Multi-document storage, auto-save & version snapshots |
| **OpenXML Processing** | `docx` + `mammoth` | Bi-directional DOCX import and generation |
| **Icons & Design System** | `lucide-react` | Microsoft Fluent UI visual styling |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v24 LTS)
- npm 9+

### Installation & Running Locally

```bash
# Navigate to the word-processor directory
cd word-processor

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

Open `http://127.0.0.1:5173` in your browser to begin creating and editing documents.

### Production Build

```bash
npm run build
```

The optimized static production assets will be built into the `dist/` folder.

---

## 🖥️ Desktop App Packaging (Optional)

To bundle this application as a standalone native desktop app:

### Option A: Electron
```bash
npm install --save-dev electron electron-builder
```
Add a simple `electron.cjs` entry point loading `dist/index.html` and package into a `.exe` or `.dmg`.

### Option B: Tauri (Lightweight Native Rust Webview)
```bash
npm install --save-dev @tauri-apps/cli
npx tauri init
npx tauri build
```
Produces a native executable under 15 MB with low memory footprint.

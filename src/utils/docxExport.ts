import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';
import type { DocumentSettings } from '../types/document';

interface StyleContext {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
}

function parseStyleAttr(styleStr: string | null): StyleContext {
  const styles: StyleContext = {};
  if (!styleStr) return styles;

  const parts = styleStr.split(';');
  for (const part of parts) {
    const [key, val] = part.split(':').map((s) => s.trim().toLowerCase());
    if (key === 'color' && val) {
      styles.color = val.replace('#', '');
    }
    if (key === 'font-family' && val) {
      styles.fontFamily = val.replace(/['"]/g, '');
    }
    if (key === 'font-size' && val) {
      const ptMatch = val.match(/(\d+)pt/);
      if (ptMatch) {
        styles.fontSize = parseInt(ptMatch[1], 10) * 2; // docx uses half-points
      }
    }
  }
  return styles;
}

function extractRuns(node: Node, parentStyle: StyleContext = {}): TextRun[] {
  const runs: TextRun[] = [];

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];

    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold: parentStyle.bold,
            italics: parentStyle.italic,
            underline: parentStyle.underline ? {} : undefined,
            strike: parentStyle.strike,
            color: parentStyle.color,
            font: parentStyle.fontFamily || 'Calibri',
            size: parentStyle.fontSize || 22, // 11pt default
          })
        );
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const inlineStyle = parseStyleAttr(el.getAttribute('style'));

      const childStyle: StyleContext = {
        ...parentStyle,
        ...inlineStyle,
        bold: parentStyle.bold || tag === 'strong' || tag === 'b',
        italic: parentStyle.italic || tag === 'em' || tag === 'i',
        underline: parentStyle.underline || tag === 'u',
        strike: parentStyle.strike || tag === 's' || tag === 'strike' || tag === 'del',
      };

      runs.push(...extractRuns(el, childStyle));
    }
  }

  return runs;
}

function getAlignment(styleAttr: string | null): (typeof AlignmentType)[keyof typeof AlignmentType] {
  if (!styleAttr) return AlignmentType.LEFT;
  if (styleAttr.includes('text-align: center') || styleAttr.includes('text-align:center')) {
    return AlignmentType.CENTER;
  }
  if (styleAttr.includes('text-align: right') || styleAttr.includes('text-align:right')) {
    return AlignmentType.RIGHT;
  }
  if (styleAttr.includes('text-align: justify') || styleAttr.includes('text-align:justify')) {
    return AlignmentType.JUSTIFIED;
  }
  return AlignmentType.LEFT;
}

export async function exportToDocx(
  htmlContent: string,
  title: string,
  settings: DocumentSettings
): Promise<void> {
  const parser = new DOMParser();
  const docDom = parser.parseFromString(htmlContent, 'text/html');
  const body = docDom.body;

  const docChildren: (Paragraph | Table)[] = [];

  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i];
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const styleAttr = el.getAttribute('style');
    const alignment = getAlignment(styleAttr);

    switch (tag) {
      case 'h1': {
        const runs = extractRuns(el, { bold: true, fontSize: 36 }); // 18pt
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment,
            children: runs,
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }
      case 'h2': {
        const runs = extractRuns(el, { bold: true, fontSize: 28 }); // 14pt
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment,
            children: runs,
            spacing: { before: 200, after: 100 },
          })
        );
        break;
      }
      case 'h3': {
        const runs = extractRuns(el, { bold: true, fontSize: 24 }); // 12pt
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            alignment,
            children: runs,
            spacing: { before: 160, after: 80 },
          })
        );
        break;
      }
      case 'p': {
        const runs = extractRuns(el);
        docChildren.push(
          new Paragraph({
            alignment,
            children: runs.length ? runs : [new TextRun('')],
            spacing: { after: 140, line: 276 },
          })
        );
        break;
      }
      case 'blockquote': {
        const runs = extractRuns(el, { italic: true, color: '555555' });
        docChildren.push(
          new Paragraph({
            alignment,
            indent: { left: 720 }, // 0.5 inch
            children: runs,
            spacing: { before: 120, after: 120 },
          })
        );
        break;
      }
      case 'ul': {
        const lis = el.querySelectorAll('li');
        lis.forEach((li) => {
          const runs = extractRuns(li);
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              children: runs,
              spacing: { after: 80 },
            })
          );
        });
        break;
      }
      case 'ol': {
        const lis = el.querySelectorAll('li');
        lis.forEach((li, idx) => {
          const runs = extractRuns(li);
          docChildren.push(
            new Paragraph({
              numbering: { reference: 'default-numbering', level: 0 },
              children: [new TextRun({ text: `${idx + 1}. ` }), ...runs],
              spacing: { after: 80 },
            })
          );
        });
        break;
      }
      case 'table': {
        const rows: TableRow[] = [];
        const trs = el.querySelectorAll('tr');
        trs.forEach((tr) => {
          const cells: TableCell[] = [];
          const ths = tr.querySelectorAll('th, td');
          ths.forEach((cell) => {
            const isHeader = cell.tagName.toLowerCase() === 'th';
            const runs = extractRuns(cell, { bold: isHeader });
            cells.push(
              new TableCell({
                children: [new Paragraph({ children: runs })],
                width: { size: 100 / (ths.length || 1), type: WidthType.PERCENTAGE },
                shading: isHeader ? { fill: 'F3F4F6' } : undefined,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
                },
              })
            );
          });
          if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }));
          }
        });

        if (rows.length > 0) {
          docChildren.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
        break;
      }
      case 'hr': {
        docChildren.push(
          new Paragraph({
            border: { bottom: { color: 'D1D5DB', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 180, after: 180 },
          })
        );
        break;
      }
      default: {
        const runs = extractRuns(el);
        if (runs.length) {
          docChildren.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
        }
      }
    }
  }

  // Margin calculation in twips (1 inch = 1440 twips)
  let marginTwips = 1440;
  if (settings.margin === 'narrow') marginTwips = 720;
  if (settings.margin === 'moderate') marginTwips = 1080;
  if (settings.margin === 'wide') marginTwips = 1800;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
              right: marginTwips,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: settings.headerText || title,
                    italics: true,
                    size: 18,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (settings.footerText || 'Page ') + ' ',
                    size: 18,
                    color: '888888',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docChildren.length ? docChildren : [new Paragraph({ text: '' })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = (title || 'Document').replace(/[/\\?%*:|"<>]/g, '_');
  saveAs(blob, `${safeFilename}.docx`);
}

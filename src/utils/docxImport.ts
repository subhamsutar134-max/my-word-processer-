import mammoth from 'mammoth';

export async function importDocxFile(file: File): Promise<{ html: string; title: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const rawHtml = result.value;

  // Derive document title from filename without extension
  const title = file.name.replace(/\.[^/.]+$/, '');

  return {
    html: rawHtml,
    title: title || 'Imported Document',
  };
}

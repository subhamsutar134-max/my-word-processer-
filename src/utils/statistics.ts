export interface DocumentStatistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function computeStatistics(html: string): DocumentStatistics {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const text = doc.body.textContent || '';

  // Clean words
  const wordsArray = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && /\w/.test(w));
  const words = wordsArray.length;

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Paragraph elements
  const paragraphElements = doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
  const paragraphs = Math.max(1, paragraphElements.length);

  // Sentences
  const sentenceMatches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  const sentences = sentenceMatches ? sentenceMatches.length : words > 0 ? 1 : 0;

  // Reading time (average 225 words per minute)
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 225));
  // Speaking time (average 130 words per minute)
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    sentences,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

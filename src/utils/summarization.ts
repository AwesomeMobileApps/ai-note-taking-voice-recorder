/**
 * Utility functions for note summarization with enhanced NLP techniques
 */

/**
 * Generate a summary of the given text using enhanced NLP techniques
 */
export const generateSummary = (text: string, maxLength: number = 150): string => {
  // Use the enhanced summarization algorithm
  return enhancedSummary(text, maxLength);
};

/**
 * Enhanced summary generation using more sophisticated NLP techniques
 */
export const enhancedSummary = (text: string, maxLength: number = 150): string => {
  // Remove markdown formatting for summarization
  const plainText = removeMarkdownFormatting(text);
  
  // Split into sentences
  const sentences = splitIntoSentences(plainText);
  
  // If very short text, return as is
  if (sentences.length <= 3) {
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  }
  
  // Calculate word frequency for TF-IDF
  const wordFrequency = calculateWordFrequency(plainText);
  
  // Score sentences based on importance
  const sentenceScores = sentences.map(sentence => ({
    sentence,
    score: calculateSentenceScore(sentence, wordFrequency)
  }));
  
  // Sort sentences by score (highest first)
  const sortedSentences = sentenceScores
    .sort((a, b) => b.score - a.score);
  
  // Get top sentences (about 30% of the original, but at least 3 and at most 5)
  const numSentences = Math.min(5, Math.max(3, Math.ceil(sentences.length * 0.3)));
  const topSentences = sortedSentences
    .slice(0, numSentences)
    .map(item => item.sentence);
  
  // Sort top sentences by their original order
  const orderedTopSentences = [];
  for (const sentence of sentences) {
    if (topSentences.includes(sentence)) {
      orderedTopSentences.push(sentence);
    }
  }
  
  // Join the sentences
  let summary = orderedTopSentences.join('. ');
  if (!summary.endsWith('.')) summary += '.';
  
  // Ensure the summary isn't too long
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }
  
  return summary;
};

/**
 * Remove markdown formatting from text
 */
const removeMarkdownFormatting = (text: string): string => {
  return text
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/>\s*(.*?)$/gm, '$1') // Remove blockquotes
    .replace(/\n{2,}/g, '. '); // Replace multiple newlines with period + space
};

/**
 * Split text into sentences
 */
const splitIntoSentences = (text: string): string[] => {
  // Split by sentence-ending punctuation followed by space or end of string
  const sentenceRegex = /[.!?]+\s+|[.!?]+$/g;
  const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);
  
  // Handle edge cases
  return sentences.map(s => s.trim());
};

/**
 * Calculate word frequency in text (for TF-IDF)
 */
const calculateWordFrequency = (text: string): Record<string, number> => {
  // Convert to lowercase and split into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/) // Split by whitespace
    .filter(word => 
      word.length > 3 && // Ignore very short words
      !commonWords.includes(word) // Ignore common words
    );
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  return wordFrequency;
};

/**
 * Calculate sentence importance score
 */
const calculateSentenceScore = (sentence: string, wordFrequency: Record<string, number>): number => {
  // Convert sentence to lowercase and split into words
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  if (words.length === 0) return 0;
  
  // Calculate score based on word frequency
  let score = 0;
  words.forEach(word => {
    if (wordFrequency[word]) {
      score += wordFrequency[word];
    }
  });
  
  // Normalize by sentence length to avoid bias towards longer sentences
  return score / words.length;
};

/**
 * Extract key topics from text with improved algorithm
 */
export const extractKeyTopics = (text: string, maxTopics: number = 5): string[] => {
  // Remove markdown and convert to lowercase
  const plainText = removeMarkdownFormatting(text).toLowerCase();
  
  // Split into words
  const words = plainText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && // Ignore very short words
      !commonWords.includes(word) // Ignore common words
    );
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Calculate TF-IDF score
  const wordScores: Record<string, number> = {};
  const totalWords = words.length;
  const uniqueWords = Object.keys(wordFrequency);
  
  uniqueWords.forEach(word => {
    // Term frequency (TF)
    const tf = wordFrequency[word] / totalWords;
    
    // Inverse document frequency (IDF) - simplified version
    // We're treating each sentence as a document
    const sentences = splitIntoSentences(plainText);
    const sentencesWithWord = sentences.filter(s => 
      s.toLowerCase().includes(word)
    ).length;
    
    const idf = Math.log(sentences.length / (sentencesWithWord || 1));
    
    // TF-IDF score
    wordScores[word] = tf * idf;
  });
  
  // Sort words by score
  const sortedWords = Object.entries(wordScores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Get top words
  return sortedWords.slice(0, maxTopics);
};

// Common words to filter out (expanded list)
const commonWords = [
  'this', 'that', 'these', 'those', 'there', 'their', 'they', 'them',
  'with', 'from', 'have', 'having', 'been', 'were', 'would', 'could',
  'should', 'about', 'which', 'when', 'what', 'where', 'who', 'whom',
  'whose', 'your', 'yours', 'some', 'will', 'just', 'very', 'really',
  'much', 'many', 'more', 'most', 'other', 'another', 'such', 'than',
  'then', 'also', 'here', 'only', 'both', 'each', 'because', 'since',
  'until', 'while', 'before', 'after', 'above', 'below', 'between',
  'under', 'over', 'again', 'further', 'during', 'these', 'through',
  'into', 'onto', 'within', 'without', 'against', 'among', 'throughout',
  'despite', 'however', 'although', 'unless', 'whereas', 'whether'
]; 
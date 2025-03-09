/**
 * Utility functions for note summarization
 */

/**
 * Generate a summary of the given text
 * This is a simple implementation that could be enhanced with NLP libraries or AI services
 */
export const generateSummary = (text: string, maxLength: number = 150): string => {
  // Remove markdown formatting for summarization
  const plainText = text
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, ''); // Remove numbered list markers

  // Split into sentences
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // If very short text, return as is
  if (sentences.length <= 3) {
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  }
  
  // Extract key sentences (first, last, and some from the middle)
  const keyPoints = [
    sentences[0], // First sentence often contains the main point
  ];
  
  // Add some sentences from the middle (if available)
  if (sentences.length > 4) {
    const middleIndex = Math.floor(sentences.length / 2);
    keyPoints.push(sentences[middleIndex]);
  }
  
  // Add the last sentence (often contains conclusions)
  if (sentences.length > 2) {
    keyPoints.push(sentences[sentences.length - 1]);
  }
  
  // Join the key sentences
  let summary = keyPoints.join('. ').trim();
  
  // Ensure the summary isn't too long
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }
  
  return summary;
};

/**
 * Extract key topics from text
 * This is a simple implementation that could be enhanced with NLP libraries
 */
export const extractKeyTopics = (text: string, maxTopics: number = 5): string[] => {
  // Remove common words and focus on potentially meaningful terms
  const plainText = text.toLowerCase();
  
  // Split into words
  const words = plainText.split(/\W+/).filter(word => 
    word.length > 3 && // Ignore very short words
    !commonWords.includes(word) // Ignore common words
  );
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top words
  return sortedWords.slice(0, maxTopics);
};

// Common words to filter out
const commonWords = [
  'this', 'that', 'these', 'those', 'there', 'their', 'they', 'them',
  'with', 'from', 'have', 'having', 'been', 'were', 'would', 'could',
  'should', 'about', 'which', 'when', 'what', 'where', 'who', 'whom',
  'whose', 'your', 'yours', 'some', 'will', 'just', 'very', 'really'
]; 
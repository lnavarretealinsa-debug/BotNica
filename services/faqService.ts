
import { FAQItem } from '../types';
import { FUZZY_SEARCH_THRESHOLD } from '../constants';

// A simple stop-word list for Spanish
const stopWords = new Set(['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'ha', 'me', 'si', 'sin', 'sobre', 'este', 'entre', 'cuando', 'muy', 'también', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'uno', 'ni', 'contra', 'ese', 'eso', 'mi', 'tú', 'qué', 'cuál', 'cómo', 'puedo', 'hacer']);

const normalizeAndTokenize = (text: string): Set<string> => {
  const tokens = text
    .toLowerCase()
    .normalize('NFD') // Separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
  return new Set(tokens);
};

const calculateJaccardSimilarity = (set1: Set<string>, set2: Set<string>): number => {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) {
    return 0;
  }
  return intersection.size / union.size;
};

export const findBestFAQMatch = (query: string, faqs: FAQItem[]): { item: FAQItem; score: number } | null => {
  if (!query || faqs.length === 0) {
    return null;
  }

  const queryTokens = normalizeAndTokenize(query);
  let bestMatch: { item: FAQItem; score: number } | null = null;

  for (const item of faqs) {
    const questionTokens = normalizeAndTokenize(item.question);
    const score = calculateJaccardSimilarity(queryTokens, questionTokens);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { item, score };
    }
  }

  if (bestMatch && bestMatch.score >= FUZZY_SEARCH_THRESHOLD) {
    return bestMatch;
  }

  return null;
};

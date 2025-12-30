
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  source?: 'LOCAL_FAQ' | 'GEMINI_API';
  latency?: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}


import React, { useState, useRef, useEffect } from 'react';
import { Message, FAQItem } from '../types';
import { findBestFAQMatch } from '../services/faqService';
import { generateResponse } from '../services/geminiService';
import { BotIcon, UserIcon, SendIcon } from './icons/Icons';
import Markdown from 'react-markdown';

interface ChatViewProps {
  faqData: FAQItem[];
  systemPrompt: string;
}

const ChatView: React.FC<ChatViewProps> = ({ faqData, systemPrompt }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-1',
      text: '¡Hola! Soy BotNica, tu asistente virtual.',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect runs only once after the component mounts for the welcome sequence
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'initial-2',
          text: 'Para poder atenderte mejor, ¿cuál es tu nombre?',
          sender: 'bot',
        },
      ]);
    }, 1000); // 1-second delay for a natural feel

    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures it runs only once

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    if (!userName) {
      const normalizedInput = currentInput.trim().toLowerCase();
      const commonGreetings = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal'];

      if (commonGreetings.includes(normalizedInput) || currentInput.length < 2) {
          // It's likely a greeting, not a name. Reprompt.
          const greetingResponse: Message = {
              id: Date.now().toString() + '-reprompt',
              text: '¡Hola! Para poder personalizar nuestra conversación, ¿podrías decirme tu nombre, por favor?',
              sender: 'bot',
          };
          setMessages((prev) => [...prev, greetingResponse]);
          return;
      }

      setUserName(currentInput);
      const welcomeMessage: Message = {
        id: Date.now().toString() + '-welcome',
        text: `¡Genial, ${currentInput}! Un placer conocerte. Ahora sí, ¿en qué puedo ayudarte?`,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, welcomeMessage]);
      return;
    }

    setIsLoading(true);

    const startTime = performance.now();
    const faqMatch = await findBestFAQMatch(currentInput, faqData);

    let botResponse: Message;

    if (faqMatch) {
      const latency = Math.round(performance.now() - startTime);
      botResponse = {
        id: Date.now().toString() + '-faq',
        text: faqMatch.answer,
        sender: 'bot',
        source: 'LOCAL_FAQ',
        latency,
      };
      console.log(`Response source: LOCAL_FAQ, Latency: ${latency}ms`);
    } else {
      const geminiText = await generateResponse(currentInput, systemPrompt, userName);
      const latency = Math.round(performance.now() - startTime);
      botResponse = {
        id: Date.now().toString() + '-gemini',
        text: geminiText,
        sender: 'bot',
        source: 'GEMINI_API',
        latency,
      };
      console.log(`Response source: GEMINI_API, Latency: ${latency}ms`);
    }
    
    setMessages((prev) => [...prev, botResponse]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
                <BotIcon />
              </div>
            )}
            <div
              className={`max-w-md lg:max-w-2xl rounded-xl px-4 py-3 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-slate-700 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-300 rounded-bl-none'
              }`}
            >
              <article className="prose prose-sm prose-invert text-white">
                <Markdown>{msg.text}</Markdown>
              </article>
              {msg.source && (
                 <div className={`text-xs mt-2 text-right ${msg.source === 'LOCAL_FAQ' ? 'text-green-400' : 'text-purple-400'}`}>
                    {msg.source === 'LOCAL_FAQ' ? 'Respuesta Rápida' : 'Asistente IA'} • {msg.latency}ms
                 </div>
              )}
            </div>
             {msg.sender === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                <UserIcon />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
                <BotIcon />
              </div>
            <div className="max-w-md rounded-xl px-4 py-3 shadow-md bg-slate-800 text-slate-300 rounded-bl-none">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></span>
                </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 bg-slate-800/50 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!userName ? "Escribe tu nombre..." : "Escribe tu pregunta aquí..."}
            className="flex-1 w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent placeholder-slate-400"
            aria-label="Chat input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;

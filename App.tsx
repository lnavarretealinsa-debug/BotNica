
import React, { useState } from 'react';
import ChatView from './components/ChatView';
import AdminView from './components/AdminView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FAQItem } from './types';
import { INITIAL_FAQ, DEFAULT_SYSTEM_PROMPT } from './constants';
import { LockClosedIcon, ChatBubbleLeftRightIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [view, setView] = useState<'chat' | 'admin'>('chat');
  const [faqData, setFaqData] = useLocalStorage<FAQItem[]>('botnica-faq', INITIAL_FAQ);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string>('botnica-prompt', DEFAULT_SYSTEM_PROMPT);

  const renderView = () => {
    if (view === 'admin') {
      return (
        <AdminView
          faqData={faqData}
          setFaqData={setFaqData}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
        />
      );
    }
    return <ChatView faqData={faqData} systemPrompt={systemPrompt} />;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          BotNica
        </h1>
        <button
          onClick={() => setView(view === 'chat' ? 'admin' : 'chat')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200"
          aria-label={view === 'chat' ? 'Switch to Admin Panel' : 'Switch to Chat'}
        >
          {view === 'chat' ? <LockClosedIcon /> : <ChatBubbleLeftRightIcon />}
          <span className="hidden sm:inline">{view === 'chat' ? 'Admin Panel' : 'Volver al Chat'}</span>
        </button>
      </header>
      <main className="flex-grow overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;

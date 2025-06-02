'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState(false);

  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`, {
        method: 'GET',
        mode: 'cors',
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.message,
          documents: data?.documents,
        },
      ]);
    } catch (err) {
      console.error('CORS or fetch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error: Unable to fetch response.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getDownloadLink = (source?: string) => {
    if (!source) return '#';
    const fileName = source.split(/[/\\]/).pop();
    return `/uploads/${fileName}`;
  };


return (
  <div className="flex flex-col h-[92vh] max-w-4xl mx-auto p-6 bg-[#121212] border border-[#2c2c2c] rounded-lg shadow-lg text-gray-300 font-sans select-text">
    <header className="mb-6 border-b border-gray-700 pb-3 flex items-center justify-between">
      <h1 className="text-3xl font-semibold tracking-wide text-white">
        PDG RAG ChatBot
      </h1>
      <div className="text-sm text-gray-500">Powered by LangChain</div>
    </header>

    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto space-y-5 px-4 mb-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
    >
      {messages.length === 0 && (
        <p className="text-gray-600 italic text-center mt-28 select-none">
          💬 Ask me anything about your PDF...
        </p>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          className={`max-w-[70%] px-5 py-3 rounded-xl whitespace-pre-wrap break-words relative flex flex-col
            ${
              msg.role === 'user'
                ? 'mr-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_10px_#00ffff88]'
                : 'ml-auto bg-gradient-to-r from-green-400 to-lime-400 text-black shadow-[0_0_10px_#39ff1499]'
            }`}
        >
          {/* Label above message */}
          <div
            className={`mb-2 font-semibold select-none ${
              msg.role === 'user' ? 'text-cyan-300' : 'text-green-900'
            }`}
          >
            {msg.role === 'user' ? 'You:' : 'HAL-1000:'}
          </div>

          <div className="leading-relaxed">{msg.content}</div>

          {msg.role === 'assistant' && msg.documents && msg.documents.length > 0 && (
            <div className="mt-5 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-inner text-gray-400">
              <h3 className="text-sm font-semibold mb-3 text-gray-300">
                📄 Documents used ({msg.documents.length})
              </h3>
              <ul className="space-y-4 max-h-56 overflow-y-auto">
                {msg.documents.map((doc, i) => (
                  <li
                    key={i}
                    className="border border-gray-700 rounded-md p-3 flex justify-between items-start"
                  >
                    <div className="flex flex-col max-w-[85%]">
                      <p className="font-semibold text-gray-300">
                        Page {doc.metadata?.loc?.pageNumber ?? '?'} -{' '}
                        {doc.metadata?.source
                          ? doc.metadata.source.split(/[/\\]/).pop()
                          : 'Unknown source'}
                      </p>
                      <p className="text-xs mt-1 whitespace-pre-wrap break-words text-gray-400 select-text">
                        {doc.pageContent?.slice(0, 250)}
                        {doc.pageContent && doc.pageContent.length > 250 ? '...' : ''}
                      </p>
                    </div>
                    <a
                      href={getDownloadLink(doc.metadata?.source)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="ml-4 inline-block bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-1 px-3 rounded transition"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>

    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) handleSendChatMessage();
      }}
      className="flex gap-4 border-t border-gray-700 pt-5"
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-5 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
        disabled={loading}
        spellCheck={false}
      />
      <Button
        type="submit"
        disabled={!message.trim() || loading}
        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 rounded-lg shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send'}
      </Button>
    </form>
  </div>
);

};

export default ChatComponent;

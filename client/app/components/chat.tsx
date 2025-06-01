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

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`, {
        method: 'GET',
        mode: 'cors', // ✅ Important for CORS
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.message,
          documents: data?.docs,
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

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <pre
            key={index}
            className={`rounded p-2 ${
              msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
            }`}
          >
            {JSON.stringify(msg, null, 2)}
          </pre>
        ))}
      </div>

      <div className="fixed bottom-4 left-0 w-full px-4 flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          className="flex-1"
        />
        <Button onClick={handleSendChatMessage} disabled={!message.trim() || loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;

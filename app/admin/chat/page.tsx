'use client';

import { usePageTitle } from "@/components/page-title-context";
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { SendIcon } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  isTyping?: boolean;
}

export default function ChatPage() {
  const { setTitle } = usePageTitle();
  const ai_endpoint = process.env.NEXT_PUBLIC_FLASK_AI_ENDPOINT_CHAT as string;

  useEffect(() => {
    setTitle("AI Chat");
    return () => setTitle("");
  }, [setTitle]);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeText = (fullText: string, callback: (text: string) => void) => {
    let index = 0;
    const speed = 20;

    const type = () => {
      if (index <= fullText.length) {
        callback(fullText.slice(0, index));
        index++;
        setTimeout(type, speed);
      }
    };

    type();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(ai_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage.text }),
      });

      const data = await res.json();
      const fullAIResponse = data.response || 'No response from AI.';

      setMessages(prev => [...prev, { sender: 'ai', text: '', isTyping: true }]);

      typeText(fullAIResponse, (typedText) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === 'ai') {
            updated[updated.length - 1] = { ...last, text: typedText };
          }
          return updated;
        });
      });

    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Error fetching AI response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Chatbot</h1>

      <div className="flex-1 overflow-y-auto rounded-lg p-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400">Start the conversation...</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              {msg.text}
              {msg.isTyping && <span className="animate-pulse"></span>}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          <SendIcon />
        </Button>
      </form>
    </section>
  );
}

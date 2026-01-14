'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Przykładowe pytania do AI
const exampleQuestions = [
  'Jakie sale są wolne dziś po 14:00?',
  'Pokaż rezerwacje na jutro',
  'Która sala ma projektor?',
  'Zarezerwuj salę na 10 osób',
];

/**
 * Widget AI Chat - pływający przycisk z oknem chatu
 * Pozwala użytkownikowi rozmawiać z asystentem AI o dostępności sal
 */
export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Cześć! 👋 Jestem asystentem AI RoomBook.\n\nMogę pomóc Ci:\n• Sprawdzić dostępność sal\n• Znaleźć wolne terminy\n• Podać informacje o salach\n\n💡 Przykładowe pytania:',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ukryj hint po 10 sekundach lub po otwarciu chatu
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) setShowHint(false);
  }, [isOpen]);

  // Automatyczne przewijanie do najnowszej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Przepraszam, nie mogę teraz połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Funkcja do wysłania przykładowego pytania
  const sendExampleQuestion = (question: string) => {
    setInputValue(question);
    // Automatycznie wyślij po krótkim opóźnieniu
    setTimeout(() => {
      const fakeEvent = { key: 'Enter', shiftKey: false, preventDefault: () => {} } as React.KeyboardEvent;
      handleKeyDown(fakeEvent);
    }, 100);
  };

  return (
    <>
      {/* Hint z animowaną strzałką */}
      {showHint && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-bounce-slow">
          <div className="bg-white rounded-xl shadow-xl border border-primary-200 px-4 py-3 max-w-[220px]">
            <p className="text-sm font-medium text-gray-800 mb-1">
              👆 To to o czym mówiłem na spotkaniu!
            </p>
            <p className="text-xs text-gray-500">
              Kliknij, aby porozmawiać z AI
            </p>
          </div>
          {/* Strzałka wskazująca w dół */}
          <div className="flex justify-end pr-4">
            <svg 
              className="w-8 h-8 text-primary-600 animate-bounce" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 16l-6-6h12l-6 6z" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-br from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900',
          'flex items-center justify-center',
          isOpen && 'rotate-180',
          !isOpen && 'hover:scale-110'
        )}
        aria-label={isOpen ? 'Zamknij chat' : 'Otwórz chat AI'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {/* Pulsująca kropka AI */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                🤖 AI Asystent
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>
                Zapytaj o dostępność sal
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Zamknij"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 min-h-64 bg-gray-50">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
                {/* Przykładowe pytania po pierwszej wiadomości */}
                {index === 0 && message.role === 'assistant' && messages.length === 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exampleQuestions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => {
                          setInputValue(question);
                        }}
                        className="text-xs px-3 py-1.5 bg-white border border-primary-200 text-primary-700 rounded-full hover:bg-primary-50 hover:border-primary-300 transition-all shadow-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Napisz wiadomość..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  inputValue.trim() && !isLoading
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
                aria-label="Wyślij"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by OpenAI GPT-4
            </p>
          </div>
        </div>
      )}
    </>
  );
}

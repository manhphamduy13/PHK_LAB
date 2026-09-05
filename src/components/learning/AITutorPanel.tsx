import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: any;
  lessonId: string;
}

export function AITutorPanel({ isOpen, onClose, context, lessonId }: AITutorPanelProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Fetch history
      fetch(`/api/learning/tutor/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
         if (data.history) setMessages(data.history);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/learning/tutor/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg.content,
          lessonId,
          context
        })
      });
      const data = await res.json();
      if (data && data.content) {
         setMessages(prev => [...prev, { role: 'assistant', content: data.content, metadata: JSON.stringify({ mode: data.mode, actions: data.suggestedActions }) }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white border-l-2 border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex flex-col p-4 bg-blue-600 text-white border-b-4 border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h2 className="font-black text-lg tracking-tight">Khê AI Tutor</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-blue-100 text-xs font-medium mt-1">Trợ lý học tập cá nhân của bạn</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 font-medium text-sm mt-10">
            Hãy đặt câu hỏi nếu bạn chưa hiểu bài nhé!
          </div>
        )}
        
        {messages.map((m, idx) => {
           const isUser = m.role === 'user';
           const metadata = m.metadata ? JSON.parse(m.metadata) : {};
           
           return (
             <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                  isUser ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white border-2 border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                }`}>
                  <p className="text-sm font-medium whitespace-pre-wrap">{m.content}</p>
                </div>
                {!isUser && metadata.mode && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{metadata.mode}</span>
                  </div>
                )}
                {!isUser && metadata.actions && metadata.actions.length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-2">
                      {metadata.actions.map((act: string, i: number) => (
                        <button key={i} onClick={() => setInput(act)} className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                          {act}
                        </button>
                      ))}
                   </div>
                )}
             </div>
           );
        })}
        {isLoading && (
          <div className="flex items-start">
             <div className="px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Đang suy nghĩ...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t-2 border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi Khê AI..."
            className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg disabled:bg-slate-300 disabled:text-slate-500 hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

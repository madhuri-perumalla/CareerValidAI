import { useState } from 'react';
import { MessageCircle, X, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCareer } from '@/store/career-store';
import { careerAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI career assistant. Ask me about:\n• Resume improvements\n• Skill roadmaps\n• Project ideas\n• Career guidance",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { state } = useCareer();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim() || !state.sessionId || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await careerAPI.sendChatMessage({
        message: message,
        sessionId: state.sessionId,
      });

      if (response.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "How can I improve my resume?",
    "What should I learn next?",
    "Suggest a project idea",
    "What roles suit my skills?",
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-80 h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Career AI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(prompt)}
                  className="text-xs h-8 justify-start"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="bg-primary hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">⚠️ AI only — not stored or saved</p>
        </div>
      </div>
    </div>
  );
}

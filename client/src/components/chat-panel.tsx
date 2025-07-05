import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send, Sparkles, Code, ArrowLeft } from "lucide-react";

interface ChatMessage {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  codeId?: number | null;
  createdAt: Date | string;
}

interface ChatPanelProps {
  sessionId: number | null;
  isGenerating: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
  currentCode?: {
    html: string;
    css: string;
    javascript: string;
  } | null;
}

export function ChatPanel({ sessionId, isGenerating, onSendMessage, onBack, currentCode }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages if we have a session
  const { data: messages = [], refetch } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/sessions/${sessionId}/messages`],
    enabled: !!sessionId,
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Refetch messages when generating state changes
    if (!isGenerating && sessionId) {
      refetch();
    }
  }, [isGenerating, sessionId, refetch]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && trimmedMessage.length <= 100) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend();
    }
  };

  return (
    <div className="w-full lg:w-1/3 glass-dark border-r border-white/10 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Chat</h2>
                <p className="text-xs text-gray-400">Powered by c1 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-purple-600/20 border border-purple-500/20 text-white'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {msg.role === 'assistant' && (
                    <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.codeId && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-purple-400">
                        <Code className="h-3 w-3" />
                        <span>Code generated</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your changes or ask for modifications... (max 100 characters)"
            className="min-h-[100px] bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            disabled={isGenerating}
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${message.length > 80 ? 'text-orange-400' : message.length > 100 ? 'text-red-400' : 'text-gray-400'}`}>
              {message.length}/100 max
            </span>
            <Button
              onClick={handleSend}
              disabled={isGenerating || message.trim().length === 0 || message.trim().length > 100}
              className="btn-gradient text-white font-medium flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Press Ctrl+Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
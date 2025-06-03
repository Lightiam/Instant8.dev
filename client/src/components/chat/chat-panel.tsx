import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "👋 Hello! I'm your deployment assistant. I can help you:\n\n• Deploy to AWS, Azure, or GCP\n• Check deployment status\n• Monitor infrastructure\n• Manage resources\n\nTry: \"deploy to AWS\" or \"check status\"",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, isConnected } = useWebSocket((message) => {
    if (message.type === "chat_response") {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: message.message,
        isUser: false,
        timestamp: new Date(message.timestamp),
      }]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendMessage({
      type: "chat_message",
      content: inputValue,
    });

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const quickActions = [
    "deploy to AWS",
    "check status",
    "show logs",
  ];

  return (
    <Card className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Deployment Assistant</CardTitle>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-primary' : 'bg-red-500'}`} />
        </div>
        <p className="text-sm text-slate-400">Chat with your infrastructure</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            {message.isUser ? (
              <>
                <div className="flex-1 flex justify-end">
                  <div className="bg-primary rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-white whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white w-4 h-4" />
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div className="bg-slate-950 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-white whitespace-pre-line">{message.content}</p>
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2 mb-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about deployments..."
            className="flex-1 bg-slate-950 border-slate-600 focus:border-primary"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary/90"
            disabled={!isConnected}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Badge
              key={action}
              variant="outline"
              className="cursor-pointer bg-slate-950 hover:bg-slate-800 border-slate-600 text-slate-300 hover:text-white transition-colors"
              onClick={() => {
                setInputValue(action);
                handleSendMessage();
              }}
            >
              {action}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

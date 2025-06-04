import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Code, Play, Settings, Copy, Download, ArrowLeft } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { EnvironmentConfig } from "@/components/env-config";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  code?: string;
  codeType?: string;
}

interface ConversationTemplate {
  id: string;
  title: string;
  description: string;
  color: string;
  prompt: string;
}

const templates: ConversationTemplate[] = [
  {
    id: "web-app",
    title: "Deploy Web App",
    description: "Create and deploy a web application",
    color: "bg-blue-500 hover:bg-blue-600",
    prompt: "I want to deploy a web application to Azure"
  },
  {
    id: "database",
    title: "Database Setup",
    description: "Set up cloud database infrastructure",
    color: "bg-green-500 hover:bg-green-600", 
    prompt: "Help me set up a PostgreSQL database on Azure"
  },
  {
    id: "container",
    title: "Container Deployment",
    description: "Deploy containerized applications",
    color: "bg-purple-500 hover:bg-purple-600",
    prompt: "Deploy a Docker container to Azure Container Instances"
  },
  {
    id: "kubernetes",
    title: "Kubernetes Cluster",
    description: "Set up Kubernetes infrastructure",
    color: "bg-orange-500 hover:bg-orange-600",
    prompt: "Create a Kubernetes cluster on Azure AKS"
  },
  {
    id: "storage",
    title: "Cloud Storage",
    description: "Configure cloud storage solutions",
    color: "bg-red-500 hover:bg-red-600",
    prompt: "Set up Azure Blob Storage with CDN"
  },
  {
    id: "network",
    title: "Network Config",
    description: "Design network infrastructure",
    color: "bg-cyan-500 hover:bg-cyan-600",
    prompt: "Create a virtual network with subnets on Azure"
  },
  {
    id: "monitoring",
    title: "Monitoring Setup",
    description: "Add monitoring and alerts",
    color: "bg-yellow-500 hover:bg-yellow-600",
    prompt: "Set up monitoring and alerting for my infrastructure"
  },
  {
    id: "security",
    title: "Security Config",
    description: "Implement security best practices",
    color: "bg-pink-500 hover:bg-pink-600",
    prompt: "Add security groups and access controls to my infrastructure"
  }
];

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEnvConfig, setShowEnvConfig] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{[key: string]: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { sendMessage } = useWebSocket((message) => {
    if (message.type === 'chat-response') {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message.message,
        isUser: false,
        timestamp: new Date(),
        code: message.code,
        codeType: message.codeType
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Send message via WebSocket
    sendMessage({
      type: 'chat-message',
      message: input
    });
  };

  const handleTemplateClick = (template: ConversationTemplate) => {
    setInput(template.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeploy = async (code?: string, codeType?: string) => {
    if (!code || !codeType) {
      toast({
        title: "Deployment Error",
        description: "No code available for deployment",
        variant: "destructive"
      });
      return;
    }

    try {
      const deploymentId = `deploy-${Date.now()}`;
      setDeploymentStatus(prev => ({ ...prev, [deploymentId]: 'deploying' }));

      toast({
        title: "Deployment Started",
        description: "Infrastructure deployment initiated to Azure",
      });

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          codeType,
          provider: 'azure',
          resourceType: 'container'
        })
      });

      if (!response.ok) {
        throw new Error(`Deployment failed: ${response.statusText}`);
      }

      const result = await response.json();
      setDeploymentStatus(prev => ({ ...prev, [deploymentId]: 'success' }));
      
      toast({
        title: "Deployment Successful",
        description: `Infrastructure deployed successfully. Deployment ID: ${result.deploymentId}`,
      });

    } catch (error: any) {
      const deploymentId = `deploy-${Date.now()}`;
      setDeploymentStatus(prev => ({ ...prev, [deploymentId]: 'failed' }));
      
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy infrastructure",
        variant: "destructive"
      });
    }
  };

  // Show conversation starter when no messages
  if (messages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">New Chat</h1>
                <p className="text-sm text-slate-400">Infrastructure as Code Generation</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnvConfig(!showEnvConfig)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Environment
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Start Conversation</h2>
            <p className="text-slate-400 text-lg">Generate and deploy cloud infrastructure through conversation</p>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className={`${template.color} p-6 rounded-xl text-white text-left hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                <h3 className="font-semibold mb-2">{template.title}</h3>
                <p className="text-sm opacity-90">{template.description}</p>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What infrastructure would you like to deploy?"
              className="w-full h-14 px-6 pr-14 bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-lg p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {/* Environment Configuration Modal */}
          {showEnvConfig && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Environment Setup</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvConfig(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                <EnvironmentConfig />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show chat interface when messages exist
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Infrastructure Chat</h1>
              <p className="text-sm text-slate-400">Active deployment session</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEnvConfig(!showEnvConfig)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Environment
          </Button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {!message.isUser && (
                    <Bot className="w-6 h-6 mt-1 flex-shrink-0 text-slate-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    {message.code && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-slate-300 bg-slate-700 px-3 py-1 rounded-full">
                            Generated {message.codeType} Code
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-9">
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-9">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 h-9"
                              onClick={() => handleDeploy(message.code, message.codeType)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Deploy to Cloud
                            </Button>
                          </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
                            <span className="text-xs text-slate-400 font-mono">terraform</span>
                          </div>
                          <pre className="text-green-400 p-4 overflow-x-auto text-sm leading-relaxed">
                            <code>{message.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                  {message.isUser && (
                    <User className="w-6 h-6 mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-xl bg-slate-800 text-slate-100">
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800 p-6">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Continue the conversation..."
              className="w-full h-12 px-6 pr-14 bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 rounded-lg p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Environment Configuration Modal */}
      {showEnvConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Environment Setup</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEnvConfig(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <EnvironmentConfig />
          </div>
        </div>
      )}
    </div>
  );
}
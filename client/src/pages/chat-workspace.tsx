import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, Code, Play, Settings, Copy, Download } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { EnvironmentConfig } from "@/components/env-config";

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
    color: "bg-blue-500",
    prompt: "I want to deploy a web application to Azure"
  },
  {
    id: "database",
    title: "Database Setup",
    description: "Set up cloud database infrastructure",
    color: "bg-green-500", 
    prompt: "Help me set up a PostgreSQL database on Azure"
  },
  {
    id: "container",
    title: "Container Deployment",
    description: "Deploy containerized applications",
    color: "bg-purple-500",
    prompt: "Deploy a Docker container to Azure Container Instances"
  },
  {
    id: "kubernetes",
    title: "Kubernetes Cluster",
    description: "Create and manage Kubernetes infrastructure",
    color: "bg-orange-500",
    prompt: "Set up an Azure Kubernetes Service cluster"
  },
  {
    id: "storage",
    title: "Cloud Storage",
    description: "Configure cloud storage solutions",
    color: "bg-pink-500",
    prompt: "Create Azure Blob Storage for my application"
  },
  {
    id: "networking",
    title: "Network Setup",
    description: "Configure virtual networks and security",
    color: "bg-cyan-500",
    prompt: "Set up Azure Virtual Network with subnets"
  },
  {
    id: "monitoring",
    title: "Monitoring & Alerts",
    description: "Set up monitoring and alerting",
    color: "bg-yellow-500",
    prompt: "Configure Azure Monitor and alerts for my infrastructure"
  },
  {
    id: "custom",
    title: "Custom Solution",
    description: "Build custom cloud infrastructure",
    color: "bg-indigo-500",
    prompt: "Help me design a custom cloud architecture"
  }
];

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeType, setCodeType] = useState("terraform");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, isConnected } = useWebSocket((message) => {
    if (message.type === "chat_response") {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: message.message,
        isUser: false,
        timestamp: new Date(message.timestamp),
        code: message.code,
        codeType: message.codeType
      }]);
      
      if (message.code) {
        setGeneratedCode(message.code);
        setCodeType(message.codeType || "terraform");
        setActiveTab("code");
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (customMessage?: string) => {
    const messageText = customMessage || inputValue;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendMessage({
      type: "chat_message",
      content: messageText,
    });

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTemplateClick = (template: ConversationTemplate) => {
    handleSendMessage(template.prompt);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infrastructure.${codeType === 'terraform' ? 'tf' : 'ts'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Chat Workspace</h1>
            <p className="text-sm text-slate-400">Generate Infrastructure-as-Code through conversation</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-slate-600"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Templates */}
        <div className="w-80 bg-slate-900 border-r border-slate-700 p-4">
          <h2 className="text-lg font-semibold mb-4">Start Conversation</h2>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:bg-slate-800 transition-colors bg-slate-950 border-slate-700"
                onClick={() => handleTemplateClick(template)}
              >
                <CardContent className="p-3">
                  <div className={`w-8 h-8 rounded-lg ${template.color} mb-2 flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <h3 className="font-medium text-sm text-white mb-1">{template.title}</h3>
                  <p className="text-xs text-slate-400">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {showSettings ? (
            <EnvironmentConfig />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 w-96 mx-6 mt-4 bg-slate-800">
                <TabsTrigger value="chat" className="data-[state=active]:bg-slate-700">Chat</TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-slate-700">Generated Code</TabsTrigger>
              </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
              {/* Chat Messages */}
              <div className="flex-1 overflow-auto px-6 pb-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-400">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <h3 className="text-lg font-medium mb-2">Welcome to Infrastructure Chat</h3>
                      <p>Choose a template from the sidebar or start typing to generate cloud infrastructure code</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        {message.isUser ? (
                          <>
                            <div className="flex-1 flex justify-end">
                              <div className="bg-primary rounded-lg p-4 max-w-2xl">
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
                            <div className="bg-slate-800 rounded-lg p-4 max-w-2xl">
                              <p className="text-sm text-white whitespace-pre-line">{message.content}</p>
                              {message.code && (
                                <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-600">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {message.codeType === 'terraform' ? 'Terraform' : 'Pulumi'}
                                    </Badge>
                                    <Button size="sm" variant="ghost" onClick={() => setActiveTab("code")}>
                                      <Code className="w-3 h-3 mr-1" />
                                      View Code
                                    </Button>
                                  </div>
                                  <pre className="text-xs text-slate-300 overflow-x-auto">
                                    {message.code.slice(0, 200)}...
                                  </pre>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-700 p-6">
                <div className="flex space-x-4">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe the infrastructure you want to create..."
                    className="flex-1 bg-slate-800 border-slate-600 focus:border-primary text-white"
                  />
                  <Button 
                    onClick={() => handleSendMessage()}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!isConnected}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-1 flex flex-col mt-4">
              {/* Code Editor */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-6 pb-4">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="bg-slate-800 border-slate-600">
                      {codeType === 'terraform' ? 'Terraform Configuration' : 'Pulumi Code'}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={codeType === 'terraform' ? 'default' : 'outline'}
                        onClick={() => setCodeType('terraform')}
                      >
                        Terraform
                      </Button>
                      <Button
                        size="sm"
                        variant={codeType === 'pulumi' ? 'default' : 'outline'}
                        onClick={() => setCodeType('pulumi')}
                      >
                        Pulumi
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={copyCode}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadCode}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Play className="w-3 h-3 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 mx-6 mb-6">
                  <div className="h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                    <pre className="h-full p-4 text-sm text-slate-300 overflow-auto">
                      <code>{generatedCode || '# Generated code will appear here after chatting...'}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
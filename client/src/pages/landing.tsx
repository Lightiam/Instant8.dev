import { Button } from "@/components/ui/button";
import { Cloud, Github, Server, Database, Globe } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="relative z-50 px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary font-mono">&lt;/&gt;</div>
            <span className="text-xl font-bold">Instanti8.dev</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-slate-400">
              <Github className="w-4 h-4" />
              <span className="text-sm">63.7k</span>
            </div>
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Sign up
            </Button>
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-primary hover:bg-primary/90"
            >
              Start
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Infrastructure as<br />
              <span className="text-primary">Code Simplified</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Instanti8.dev transforms complex infrastructure provisioning into simple, declarative code.
              Define once, deploy everywhere - seamlessly orchestrate resources across AWS, Azure, and GCP 
              with intelligent automation, version control, and collaborative workflows.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
            <Button 
              onClick={() => setLocation("/dashboard")}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8"
            >
              Start
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-600 hover:border-slate-500 text-white px-8"
            >
              Sign up
            </Button>
          </div>

          {/* Graphical Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                  <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#06d6a0" stopOpacity="0.4"/>
                  </linearGradient>
                </defs>
                
                <rect width="400" height="300" fill="url(#grid)"/>
                
                {/* Code Editor Window */}
                <rect x="20" y="40" width="180" height="120" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <rect x="20" y="40" width="180" height="24" rx="8" fill="#334155"/>
                <circle cx="32" cy="52" r="3" fill="#ef4444"/>
                <circle cx="44" cy="52" r="3" fill="#f59e0b"/>
                <circle cx="56" cy="52" r="3" fill="#10b981"/>
                
                {/* Code Lines */}
                <rect x="30" y="75" width="80" height="3" fill="#10b981" opacity="0.8"/>
                <rect x="30" y="85" width="60" height="3" fill="#06b6d4" opacity="0.6"/>
                <rect x="30" y="95" width="100" height="3" fill="#8b5cf6" opacity="0.6"/>
                <rect x="30" y="105" width="40" height="3" fill="#10b981" opacity="0.8"/>
                <rect x="30" y="115" width="90" height="3" fill="#06b6d4" opacity="0.6"/>
                <rect x="30" y="125" width="70" height="3" fill="#f59e0b" opacity="0.6"/>
                <rect x="30" y="135" width="50" height="3" fill="#10b981" opacity="0.8"/>
                
                {/* Deployment Arrow */}
                <path d="M 210 100 L 240 100" stroke="url(#codeGradient)" strokeWidth="3" markerEnd="url(#arrowhead)"/>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10b981"/>
                  </marker>
                </defs>
                
                {/* Cloud Providers */}
                {/* AWS */}
                <rect x="260" y="60" width="50" height="35" rx="6" fill="#ff9900" fillOpacity="0.2" stroke="#ff9900" strokeWidth="1"/>
                <text x="285" y="80" textAnchor="middle" fill="#ff9900" fontSize="10" fontWeight="bold">AWS</text>
                
                {/* Azure */}
                <rect x="260" y="110" width="50" height="35" rx="6" fill="#0078d4" fillOpacity="0.2" stroke="#0078d4" strokeWidth="1"/>
                <text x="285" y="130" textAnchor="middle" fill="#0078d4" fontSize="10" fontWeight="bold">Azure</text>
                
                {/* GCP */}
                <rect x="260" y="160" width="50" height="35" rx="6" fill="#4285f4" fillOpacity="0.2" stroke="#4285f4" strokeWidth="1"/>
                <text x="285" y="180" textAnchor="middle" fill="#4285f4" fontSize="10" fontWeight="bold">GCP</text>
                
                {/* Connection Lines */}
                <path d="M 240 100 L 260 77" stroke="#10b981" strokeWidth="2" opacity="0.6"/>
                <path d="M 240 100 L 260 127" stroke="#10b981" strokeWidth="2" opacity="0.6"/>
                <path d="M 240 100 L 260 177" stroke="#10b981" strokeWidth="2" opacity="0.6"/>
                
                {/* Resource Icons */}
                <circle cx="330" cy="75" r="8" fill="#10b981" fillOpacity="0.3" stroke="#10b981"/>
                <circle cx="345" cy="85" r="6" fill="#06b6d4" fillOpacity="0.3" stroke="#06b6d4"/>
                <circle cx="330" cy="125" r="8" fill="#10b981" fillOpacity="0.3" stroke="#10b981"/>
                <circle cx="345" cy="135" r="6" fill="#8b5cf6" fillOpacity="0.3" stroke="#8b5cf6"/>
                <circle cx="330" cy="175" r="8" fill="#10b981" fillOpacity="0.3" stroke="#10b981"/>
                <circle cx="345" cy="185" r="6" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b"/>
                
                {/* Floating Elements */}
                <circle cx="80" cy="20" r="2" fill="#10b981" opacity="0.4">
                  <animate attributeName="cy" values="20;25;20" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="320" cy="30" r="1.5" fill="#06b6d4" opacity="0.5">
                  <animate attributeName="cy" values="30;35;30" dur="4s" repeatCount="indefinite"/>
                </circle>
                <circle cx="160" cy="220" r="2.5" fill="#8b5cf6" opacity="0.3">
                  <animate attributeName="cy" values="220;225;220" dur="5s" repeatCount="indefinite"/>
                </circle>
                
                {/* Terminal/CLI */}
                <rect x="20" y="180" width="160" height="80" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <rect x="25" y="185" width="10" height="2" fill="#10b981"/>
                <rect x="38" y="185" width="60" height="2" fill="#64748b"/>
                <rect x="25" y="195" width="80" height="2" fill="#06b6d4"/>
                <rect x="25" y="205" width="40" height="2" fill="#f59e0b"/>
                <rect x="25" y="215" width="100" height="2" fill="#10b981"/>
                <rect x="25" y="225" width="15" height="2" fill="#64748b"/>
                <rect x="45" y="225" width="5" height="2" fill="#10b981">
                  <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
                </rect>
              </svg>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-mono text-lg">{"{}"}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Declarative Configuration</h3>
              <p className="text-slate-400 text-sm">Define infrastructure using YAML, JSON, or HCL. Version controlled, predictable, and repeatable deployments.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-mono text-lg">∞</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">GitOps Workflows</h3>
              <p className="text-slate-400 text-sm">Automated CI/CD pipelines with drift detection, compliance monitoring, and rollback capabilities.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-mono text-lg">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Resource Optimization</h3>
              <p className="text-slate-400 text-sm">AI-powered cost analysis, resource rightsizing, and automated scaling policies across cloud providers.</p>
            </div>
          </div>

          {/* Cloud Providers */}
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <Server className="text-white w-3 h-3" />
              </div>
              <span className="text-sm">AWS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <Database className="text-white w-3 h-3" />
              </div>
              <span className="text-sm">Azure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                <Globe className="text-white w-3 h-3" />
              </div>
              <span className="text-sm">GCP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-xs font-bold">AI</span>
              </div>
              <span className="text-sm">MCTS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs font-bold">M</span>
              </div>
              <span className="text-sm">MCP</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

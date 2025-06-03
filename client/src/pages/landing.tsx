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
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Product</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Developers</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Enterprise</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Docs</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Blog</a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-slate-400">
              <Github className="w-4 h-4" />
              <span className="text-sm">63.7k</span>
            </div>
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Sign In
            </Button>
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-primary hover:bg-primary/90"
            >
              Start your project
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Infrastructure as<br />
            <span className="text-primary">Code Simplified</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Instanti8.dev transforms complex infrastructure provisioning into simple, declarative code.
            Define once, deploy everywhere - seamlessly orchestrate resources across AWS, Azure, and GCP 
            with intelligent automation, version control, and collaborative workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              onClick={() => setLocation("/dashboard")}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8"
            >
              Start provisioning
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-600 hover:border-slate-500 text-white px-8"
            >
              View templates
            </Button>
          </div>

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

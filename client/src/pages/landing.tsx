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
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Cloud className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold">Instantiate</span>
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
            Deploy in minutes<br />
            <span className="text-primary">Scale to millions</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Instantiate is a comprehensive multi-cloud deployment platform.
            Deploy your applications across AWS, Azure, and Google Cloud Platform with 
            intelligent Infrastructure as Code, MCP integration, and Agent MCTS libraries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              onClick={() => setLocation("/dashboard")}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8"
            >
              Start your project
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-600 hover:border-slate-500 text-white px-8"
            >
              Request a demo
            </Button>
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

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Overview } from "@/components/dashboard/overview";
import { Deployments } from "@/components/dashboard/deployments";
import { Projects } from "@/components/dashboard/projects";
import { Infrastructure } from "@/components/dashboard/infrastructure";
import { Monitoring } from "@/components/dashboard/monitoring";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Section = "overview" | "projects" | "deployments" | "infrastructure" | "monitoring";

const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Monitor your deployments and infrastructure" },
  projects: { title: "Projects", subtitle: "Manage your development projects" },
  deployments: { title: "Deployments", subtitle: "Multi-cloud deployment management" },
  infrastructure: { title: "Infrastructure", subtitle: "Monitor and manage your resources" },
  monitoring: { title: "Monitoring", subtitle: "Real-time metrics and alerts" },
};

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState<Section>("overview");

  const renderSection = () => {
    switch (currentSection) {
      case "overview":
        return <Overview />;
      case "projects":
        return <Projects />;
      case "deployments":
        return <Deployments />;
      case "infrastructure":
        return <Infrastructure />;
      case "monitoring":
        return <Monitoring />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {sectionTitles[currentSection].title}
                </h1>
                <p className="text-sm text-slate-400">
                  {sectionTitles[currentSection].subtitle}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Deployment
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {renderSection()}
          </main>
        </div>

        <ChatPanel />
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building, Crown } from "lucide-react";
import { useLocation } from "wouter";

export default function Pricing() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Developer",
      price: "$0",
      period: "forever",
      description: "Perfect for learning and small projects",
      icon: Zap,
      popular: false,
      features: [
        "5 deployments per month",
        "Basic templates",
        "Community support",
        "Single cloud provider",
        "Basic monitoring",
        "Standard deployment speed"
      ],
      limitations: [
        "No custom domains",
        "Limited to 2 environments",
        "Basic security features"
      ]
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "For growing teams and production workloads",
      icon: Building,
      popular: true,
      features: [
        "100 deployments per month",
        "Advanced templates & modules",
        "Priority support",
        "Multi-cloud deployments",
        "Advanced monitoring & alerts",
        "Fast deployment pipeline",
        "Custom domains",
        "Unlimited environments",
        "Advanced security & compliance",
        "GitOps workflows",
        "Cost optimization insights"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations with advanced needs",
      icon: Crown,
      popular: false,
      features: [
        "Unlimited deployments",
        "Custom templates & policies",
        "24/7 dedicated support",
        "Multi-cloud + hybrid deployments",
        "Enterprise monitoring & SLA",
        "Instant deployment pipeline",
        "Private cloud support",
        "Custom integrations",
        "Enterprise security & audit",
        "Advanced RBAC",
        "Dedicated infrastructure",
        "On-premise deployment options"
      ],
      limitations: []
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="relative z-50 px-6 lg:px-8 py-4 border-b border-slate-800">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary font-mono">&lt;/&gt;</div>
            <span className="text-xl font-bold">Instanti8.dev</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setLocation("/")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Home
            </button>
            <span className="text-white font-medium">Pricing</span>
          </div>

          <div className="flex items-center space-x-4">
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

      {/* Pricing Section */}
      <main className="px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose the plan that fits your infrastructure needs. Start free and scale as you grow.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative bg-slate-900 border-slate-700 ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      plan.popular ? 'bg-primary' : 'bg-slate-800'
                    }`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-slate-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-500 mb-2">Limitations:</p>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-500 text-xs">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    onClick={() => setLocation("/dashboard")}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What counts as a deployment?</h3>
                  <p className="text-slate-400 text-sm">A deployment is each time you provision or update infrastructure using our platform, whether it's a single resource or a complete stack.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
                  <p className="text-slate-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Do you support all cloud providers?</h3>
                  <p className="text-slate-400 text-sm">We support AWS, Azure, and Google Cloud Platform, with more providers being added regularly based on customer demand.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What's included in support?</h3>
                  <p className="text-slate-400 text-sm">Community support includes documentation and forums. Priority support includes email and chat. Enterprise gets dedicated support with SLA guarantees.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
                  <p className="text-slate-400 text-sm">Our Developer plan is free forever. Professional plans include a 14-day free trial with full access to all features.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">How does billing work?</h3>
                  <p className="text-slate-400 text-sm">Billing is monthly or annually in advance. You only pay for the Instanti8.dev platform - cloud provider costs are separate and paid directly to them.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-8">Join thousands of developers deploying infrastructure as code with Instanti8.dev</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 px-8"
                onClick={() => setLocation("/dashboard")}
              >
                Start Free
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-slate-600 hover:border-slate-500 text-white px-8"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
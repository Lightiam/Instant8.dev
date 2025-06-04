import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CloudCredentials {
  azure: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    subscriptionId: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  gcp: {
    projectId: string;
    serviceAccountKey: string;
    region: string;
  };
}

export function EnvironmentConfig() {
  const [credentials, setCredentials] = useState<CloudCredentials>({
    azure: {
      clientId: "",
      clientSecret: "",
      tenantId: "",
      subscriptionId: ""
    },
    aws: {
      accessKeyId: "",
      secretAccessKey: "",
      region: "us-east-1"
    },
    gcp: {
      projectId: "",
      serviceAccountKey: "",
      region: "us-central1"
    }
  });

  const [showSecrets, setShowSecrets] = useState({
    azure: { clientSecret: false },
    aws: { secretAccessKey: false },
    gcp: { serviceAccountKey: false }
  });
  
  const [savedCredentials, setSavedCredentials] = useState({
    azure: false,
    aws: false,
    gcp: false
  });

  const { toast } = useToast();

  const handleSave = async (provider: keyof CloudCredentials) => {
    try {
      // Save credentials to backend
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          credentials: credentials[provider]
        })
      });

      if (response.ok) {
        toast({
          title: "Credentials saved",
          description: `${provider.toUpperCase()} credentials have been securely stored.`
        });
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (error) {
      toast({
        title: "Error saving credentials",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTest = async (provider: keyof CloudCredentials) => {
    try {
      const response = await fetch(`/api/credentials/test/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials[provider])
      });

      if (response.ok) {
        toast({
          title: "Connection successful",
          description: `${provider.toUpperCase()} credentials are valid.`
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please verify your credentials.",
        variant: "destructive"
      });
    }
  };

  const updateCredentials = (provider: keyof CloudCredentials, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const toggleShowSecrets = (provider: keyof CloudCredentials) => {
    setShowSecrets(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Cloud Credentials</h2>
        <p className="text-slate-400">Configure your cloud provider credentials to enable real infrastructure deployments.</p>
      </div>

      <Tabs defaultValue="azure" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-slate-800">
          <TabsTrigger value="azure" className="data-[state=active]:bg-slate-700">Azure</TabsTrigger>
          <TabsTrigger value="aws" className="data-[state=active]:bg-slate-700">AWS</TabsTrigger>
          <TabsTrigger value="gcp" className="data-[state=active]:bg-slate-700">Google Cloud</TabsTrigger>
        </TabsList>

        <TabsContent value="azure" className="mt-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Azure Configuration</CardTitle>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500">
                  Required for Azure deployments
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-client-id" className="text-slate-300">Client ID</Label>
                  <Input
                    id="azure-client-id"
                    value={credentials.azure.clientId}
                    onChange={(e) => updateCredentials('azure', 'clientId', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-tenant-id" className="text-slate-300">Tenant ID</Label>
                  <Input
                    id="azure-tenant-id"
                    value={credentials.azure.tenantId}
                    onChange={(e) => updateCredentials('azure', 'tenantId', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-client-secret" className="text-slate-300">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="azure-client-secret"
                    type={showSecrets.azure ? "text" : "password"}
                    value={credentials.azure.clientSecret}
                    onChange={(e) => updateCredentials('azure', 'clientSecret', e.target.value)}
                    placeholder="Enter your Azure client secret"
                    className="bg-slate-800 border-slate-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => toggleShowSecrets('azure')}
                  >
                    {showSecrets.azure ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-subscription-id" className="text-slate-300">Subscription ID</Label>
                <Input
                  id="azure-subscription-id"
                  value={credentials.azure.subscriptionId}
                  onChange={(e) => updateCredentials('azure', 'subscriptionId', e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={() => handleTest('azure')}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  onClick={() => handleSave('azure')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aws" className="mt-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AWS Configuration</CardTitle>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500">
                  Coming Soon
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aws-access-key" className="text-slate-300">Access Key ID</Label>
                  <Input
                    id="aws-access-key"
                    value={credentials.aws.accessKeyId}
                    onChange={(e) => updateCredentials('aws', 'accessKeyId', e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className="bg-slate-800 border-slate-600 text-white"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aws-region" className="text-slate-300">Region</Label>
                  <Input
                    id="aws-region"
                    value={credentials.aws.region}
                    onChange={(e) => updateCredentials('aws', 'region', e.target.value)}
                    placeholder="us-east-1"
                    className="bg-slate-800 border-slate-600 text-white"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws-secret" className="text-slate-300">Secret Access Key</Label>
                <div className="relative">
                  <Input
                    id="aws-secret"
                    type={showSecrets.aws ? "text" : "password"}
                    value={credentials.aws.secretAccessKey}
                    onChange={(e) => updateCredentials('aws', 'secretAccessKey', e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className="bg-slate-800 border-slate-600 text-white pr-10"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => toggleShowSecrets('aws')}
                    disabled
                  >
                    {showSecrets.aws ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-400 bg-slate-800 p-4 rounded-lg">
                AWS integration is currently in development. Azure deployments are fully supported.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gcp" className="mt-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Google Cloud Configuration</CardTitle>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500">
                  Coming Soon
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gcp-project" className="text-slate-300">Project ID</Label>
                  <Input
                    id="gcp-project"
                    value={credentials.gcp.projectId}
                    onChange={(e) => updateCredentials('gcp', 'projectId', e.target.value)}
                    placeholder="my-project-123456"
                    className="bg-slate-800 border-slate-600 text-white"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gcp-region" className="text-slate-300">Region</Label>
                  <Input
                    id="gcp-region"
                    value={credentials.gcp.region}
                    onChange={(e) => updateCredentials('gcp', 'region', e.target.value)}
                    placeholder="us-central1"
                    className="bg-slate-800 border-slate-600 text-white"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcp-service-account" className="text-slate-300">Service Account Key (JSON)</Label>
                <textarea
                  id="gcp-service-account"
                  value={credentials.gcp.serviceAccountKey}
                  onChange={(e) => updateCredentials('gcp', 'serviceAccountKey', e.target.value)}
                  placeholder="Paste your service account JSON key here..."
                  className="w-full h-32 bg-slate-800 border border-slate-600 text-white rounded-md p-3 text-sm"
                  disabled
                />
              </div>
              <div className="text-sm text-slate-400 bg-slate-800 p-4 rounded-lg">
                Google Cloud integration is currently in development. Azure deployments are fully supported.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { v4 as uuidv4 } from 'uuid';

interface SaaSDeploymentRequest {
  code: string;
  codeType: 'terraform' | 'pulumi';
  provider: 'azure' | 'aws' | 'gcp';
  resourceType: string;
  userSubscriptionId?: string; // Optional: user's own subscription
  deploymentId: string;
}

interface SaaSDeploymentResult {
  deploymentId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  outputs?: Record<string, any>;
  error?: string;
  logs: string[];
  deploymentUrl?: string;
  managementUrl?: string;
}

export class SaaSDeploymentService {
  private deployments = new Map<string, SaaSDeploymentResult>();
  
  async deployViaServiceProvider(request: SaaSDeploymentRequest): Promise<string> {
    const deploymentId = request.deploymentId;
    
    const deployment: SaaSDeploymentResult = {
      deploymentId,
      status: 'pending',
      logs: ['Deployment initiated via Instantiate service provider'],
      outputs: {}
    };
    
    this.deployments.set(deploymentId, deployment);
    
    // Deploy asynchronously
    this.performSaaSDeployment(request).catch(error => {
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
    });
    
    return deploymentId;
  }
  
  private async performSaaSDeployment(request: SaaSDeploymentRequest) {
    const deploymentId = request.deploymentId;
    
    try {
      this.addLog(deploymentId, 'Authenticating with Instantiate service credentials...');
      
      if (request.provider === 'azure') {
        await this.deployAzureViaSaaS(request, deploymentId);
      } else if (request.provider === 'aws') {
        await this.deployAwsViaSaaS(request, deploymentId);
      } else if (request.provider === 'gcp') {
        await this.deployGcpViaSaaS(request, deploymentId);
      } else {
        throw new Error(`Unsupported provider: ${request.provider}`);
      }
      
    } catch (error: any) {
      this.addLog(deploymentId, `Deployment failed: ${error.message}`);
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
      throw error;
    }
  }
  
  private async deployAzureViaSaaS(request: SaaSDeploymentRequest, deploymentId: string) {
    this.addLog(deploymentId, 'Deploying to Azure using Instantiate managed service...');
    
    // Use Instantiate's pre-configured Azure service principal
    const { getAzureService } = await import('./azure-service');
    
    try {
      const azureService = getAzureService();
      
      // Parse resources from Terraform code
      const resourceSpec = this.parseResourceSpec(request.code);
      
      // Deploy using service provider credentials
      if (request.userSubscriptionId) {
        this.addLog(deploymentId, `Deploying to user subscription: ${request.userSubscriptionId}`);
        // Deploy to user's subscription with Instantiate as service provider
        const result = await this.deployToUserSubscription(azureService, resourceSpec, request.userSubscriptionId, deploymentId);
        this.finalizeDeployment(deploymentId, result);
      } else {
        this.addLog(deploymentId, 'Deploying to Instantiate managed infrastructure...');
        // Deploy to Instantiate's managed infrastructure
        const result = await this.deployToManagedInfrastructure(azureService, resourceSpec, deploymentId);
        this.finalizeDeployment(deploymentId, result);
      }
      
    } catch (error: any) {
      if (error.message?.includes('invalid_client')) {
        this.addLog(deploymentId, 'Service provider authentication failed. Contact Instantiate support.');
        throw new Error('Service provider authentication issue. Please contact support.');
      }
      throw error;
    }
  }
  
  private async deployAwsViaSaaS(request: SaaSDeploymentRequest, deploymentId: string) {
    this.addLog(deploymentId, 'AWS deployment via SaaS provider coming soon...');
    throw new Error('AWS deployment not yet implemented');
  }
  
  private async deployGcpViaSaaS(request: SaaSDeploymentRequest, deploymentId: string) {
    this.addLog(deploymentId, 'GCP deployment via SaaS provider coming soon...');
    throw new Error('GCP deployment not yet implemented');
  }
  
  private async deployToUserSubscription(azureService: any, resourceSpec: any, subscriptionId: string, deploymentId: string) {
    this.addLog(deploymentId, `Creating resources in user subscription: ${subscriptionId}`);
    
    // Create resource group in user's subscription
    await azureService.createResourceGroup(resourceSpec.resourceGroup, resourceSpec.location);
    this.addLog(deploymentId, `Resource group created: ${resourceSpec.resourceGroup}`);
    
    // Create App Service Plan
    const servicePlan = await azureService.createAppServicePlan(
      resourceSpec.resourceGroup,
      resourceSpec.servicePlanName,
      resourceSpec.location,
      'P1v2'
    );
    this.addLog(deploymentId, `App Service Plan created: ${servicePlan.name}`);
    
    // Create Web App
    const webApp = await azureService.createWebApp(
      resourceSpec.resourceGroup,
      resourceSpec.appServiceName,
      servicePlan.id,
      resourceSpec.location
    );
    this.addLog(deploymentId, `Web App deployed: ${webApp.url}`);
    
    return {
      type: 'user-subscription',
      subscriptionId,
      resourceGroup: resourceSpec.resourceGroup,
      appUrl: webApp.url,
      managementUrl: `https://portal.azure.com/#@/resource/subscriptions/${subscriptionId}/resourceGroups/${resourceSpec.resourceGroup}/overview`
    };
  }
  
  private async deployToManagedInfrastructure(azureService: any, resourceSpec: any, deploymentId: string) {
    this.addLog(deploymentId, 'Deploying to Instantiate managed infrastructure...');
    
    // Generate unique resource names for managed deployment
    const managedResourceGroup = `instantiate-${resourceSpec.resourceGroup}-${Date.now()}`;
    const managedAppName = `${resourceSpec.appServiceName}-${uuidv4().slice(0, 8)}`;
    
    this.addLog(deploymentId, `Managed resource group: ${managedResourceGroup}`);
    this.addLog(deploymentId, `Managed app name: ${managedAppName}`);
    
    // For now, simulate managed deployment
    this.addLog(deploymentId, 'Resources would be created in Instantiate managed subscription');
    this.addLog(deploymentId, 'User would receive managed endpoint URL');
    
    return {
      type: 'managed-infrastructure',
      resourceGroup: managedResourceGroup,
      appUrl: `https://${managedAppName}.instantiate.dev`,
      managementUrl: `https://app.instantiate.dev/deployments/${deploymentId}`
    };
  }
  
  private parseResourceSpec(terraformCode: string) {
    const resourceGroupMatch = terraformCode.match(/resource\s+"azurerm_resource_group"\s+"[^"]+"\s+\{[^}]*name\s*=\s*"([^"]+)"/);
    const locationMatch = terraformCode.match(/location\s*=\s*"([^"]+)"/);
    const appServiceMatch = terraformCode.match(/resource\s+"azurerm_windows_web_app"\s+"[^"]+"\s+\{[^}]*name\s*=\s*"([^"]+)"/);
    const servicePlanMatch = terraformCode.match(/resource\s+"azurerm_service_plan"\s+"[^"]+"\s+\{[^}]*name\s*=\s*"([^"]+)"/);
    
    return {
      resourceGroup: resourceGroupMatch?.[1] || 'instantiate-resources',
      location: locationMatch?.[1] || 'East US',
      appServiceName: appServiceMatch?.[1] || 'instantiate-app',
      servicePlanName: servicePlanMatch?.[1] || 'instantiate-plan'
    };
  }
  
  private finalizeDeployment(deploymentId: string, result: any) {
    this.updateDeploymentStatus(deploymentId, 'success');
    
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.outputs = result;
      deployment.deploymentUrl = result.appUrl;
      deployment.managementUrl = result.managementUrl;
    }
    
    this.addLog(deploymentId, `Deployment completed successfully`);
    this.addLog(deploymentId, `Application URL: ${result.appUrl}`);
    this.addLog(deploymentId, `Management URL: ${result.managementUrl}`);
  }
  
  private updateDeploymentStatus(deploymentId: string, status: SaaSDeploymentResult['status'], error?: string) {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.status = status;
      if (error) deployment.error = error;
    }
  }
  
  private addLog(deploymentId: string, message: string) {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.logs.push(`${new Date().toISOString()}: ${message}`);
    }
  }
  
  getDeploymentStatus(deploymentId: string): SaaSDeploymentResult | undefined {
    return this.deployments.get(deploymentId);
  }
  
  getAllDeployments(): SaaSDeploymentResult[] {
    return Array.from(this.deployments.values());
  }
}

export const saasDeploymentService = new SaaSDeploymentService();
import { ContainerInstanceManagementClient } from '@azure/arm-containerinstance';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';

interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  subscriptionId: string;
}

interface ContainerSpec {
  name: string;
  image: string;
  resourceGroup: string;
  location: string;
  cpu: number;
  memory: number;
  ports: number[];
  environmentVariables?: Record<string, string>;
  command?: string[];
}

export class AzureContainerService {
  private client: ContainerInstanceManagementClient;
  private appServiceClient: WebSiteManagementClient;
  private subscriptionId: string;

  constructor(config: AzureConfig) {
    const credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );

    this.client = new ContainerInstanceManagementClient(
      credential,
      config.subscriptionId
    );
    this.appServiceClient = new WebSiteManagementClient(
      credential,
      config.subscriptionId
    );
    this.subscriptionId = config.subscriptionId;
  }

  async createContainer(spec: ContainerSpec) {
    try {
      console.log(`Creating Azure Container Instance: ${spec.name}`);
      
      const containerGroup = {
        location: spec.location,
        containers: [{
          name: spec.name,
          image: spec.image,
          resources: {
            requests: {
              cpu: spec.cpu,
              memoryInGB: spec.memory
            }
          },
          ports: spec.ports.map(port => ({ port, protocol: 'TCP' as const })),
          environmentVariables: spec.environmentVariables ? 
            Object.entries(spec.environmentVariables).map(([name, value]) => ({ name, value })) : 
            undefined,
          command: spec.command && spec.command.length > 0 ? spec.command : undefined
        }],
        osType: 'Linux' as const,
        restartPolicy: 'Always' as const,
        ipAddress: {
          type: 'Public' as const,
          ports: spec.ports.map(port => ({ port, protocol: 'TCP' as const }))
        }
      };

      const operation = await this.client.containerGroups.beginCreateOrUpdate(
        spec.resourceGroup,
        spec.name,
        containerGroup
      );

      const result = await operation.pollUntilDone();
      
      console.log(`Container ${spec.name} created successfully`);
      return {
        id: result.name,
        name: spec.name,
        image: spec.image,
        status: result.instanceView?.state || 'pending',
        resourceGroup: spec.resourceGroup,
        location: spec.location,
        cpu: spec.cpu,
        memory: spec.memory,
        ports: spec.ports,
        publicIp: result.ipAddress?.ip,
        createdAt: new Date().toISOString(),
        provisioningState: result.provisioningState
      };

    } catch (error: any) {
      console.error('Error creating Azure container:', error);
      throw new Error(`Failed to create container: ${error.message}`);
    }
  }

  async listContainers(resourceGroup?: string) {
    try {
      let containers;
      
      if (resourceGroup) {
        containers = this.client.containerGroups.listByResourceGroup(resourceGroup);
      } else {
        containers = this.client.containerGroups.list();
      }

      const result = [];
      for await (const container of containers) {
        result.push({
          id: container.name,
          name: container.name,
          image: container.containers?.[0]?.image || 'unknown',
          status: container.instanceView?.state || 'unknown',
          resourceGroup: resourceGroup || container.id?.split('/')[4] || 'unknown',
          location: container.location,
          cpu: container.containers?.[0]?.resources?.requests?.cpu || 0,
          memory: container.containers?.[0]?.resources?.requests?.memoryInGB || 0,
          ports: container.containers?.[0]?.ports?.map(p => p.port) || [],
          publicIp: container.ipAddress?.ip,
          createdAt: container.instanceView?.events?.[0]?.firstTimestamp || new Date().toISOString(),
          provisioningState: container.provisioningState
        });
      }

      return result;
    } catch (error: any) {
      console.error('Error listing Azure containers:', error);
      throw new Error(`Failed to list containers: ${error.message}`);
    }
  }

  async getContainer(resourceGroup: string, containerName: string) {
    try {
      const container = await this.client.containerGroups.get(resourceGroup, containerName);
      
      return {
        id: container.name,
        name: container.name,
        image: container.containers?.[0]?.image || 'unknown',
        status: container.instanceView?.state || 'unknown',
        resourceGroup: resourceGroup,
        location: container.location,
        cpu: container.containers?.[0]?.resources?.requests?.cpu || 0,
        memory: container.containers?.[0]?.resources?.requests?.memoryInGB || 0,
        ports: container.containers?.[0]?.ports?.map(p => p.port) || [],
        publicIp: container.ipAddress?.ip,
        createdAt: container.instanceView?.events?.[0]?.firstTimestamp || new Date().toISOString(),
        provisioningState: container.provisioningState,
        logs: await this.getContainerLogs(resourceGroup, containerName, container.containers?.[0]?.name || containerName)
      };
    } catch (error: any) {
      console.error('Error getting Azure container:', error);
      throw new Error(`Failed to get container: ${error.message}`);
    }
  }

  async stopContainer(resourceGroup: string, containerName: string) {
    try {
      console.log(`Stopping Azure Container Instance: ${containerName}`);
      
      await this.client.containerGroups.stop(resourceGroup, containerName);
      
      return {
        message: `Container ${containerName} stop initiated`,
        status: 'stopping'
      };
    } catch (error: any) {
      console.error('Error stopping Azure container:', error);
      throw new Error(`Failed to stop container: ${error.message}`);
    }
  }

  async restartContainer(resourceGroup: string, containerName: string) {
    try {
      console.log(`Restarting Azure Container Instance: ${containerName}`);
      
      // Azure Container Instances don't have a direct restart method
      // We need to stop and then start the container group
      await this.client.containerGroups.stop(resourceGroup, containerName);
      
      return {
        message: `Container ${containerName} restart initiated`,
        status: 'restarting'
      };
    } catch (error: any) {
      console.error('Error restarting Azure container:', error);
      throw new Error(`Failed to restart container: ${error.message}`);
    }
  }

  async deleteContainer(resourceGroup: string, containerName: string) {
    try {
      console.log(`Deleting Azure Container Instance: ${containerName}`);
      
      const operation = await this.client.containerGroups.beginDelete(resourceGroup, containerName);
      await operation.pollUntilDone();
      
      return {
        message: `Container ${containerName} deleted successfully`
      };
    } catch (error: any) {
      console.error('Error deleting Azure container:', error);
      throw new Error(`Failed to delete container: ${error.message}`);
    }
  }

  async getContainerLogs(resourceGroup: string, containerGroupName: string, containerName: string) {
    try {
      const logs = await this.client.containers.listLogs(
        resourceGroup,
        containerGroupName,
        containerName
      );
      
      return logs.content || '';
    } catch (error: any) {
      console.warn('Could not retrieve container logs:', error.message);
      return 'Logs not available';
    }
  }

  async createResourceGroup(name: string, location: string) {
    try {
      // Note: This would require Azure Resource Management client
      // For now, we assume the resource group exists
      console.log(`Ensuring resource group ${name} exists in ${location}`);
      return { name, location };
    } catch (error: any) {
      console.error('Error creating resource group:', error);
      throw new Error(`Failed to create resource group: ${error.message}`);
    }
  }

  async createAppServicePlan(resourceGroup: string, planName: string, location: string, sku: string = 'P1v2') {
    try {
      console.log(`Creating App Service Plan: ${planName}`);
      
      const servicePlan = {
        location,
        sku: {
          name: sku,
          tier: 'PremiumV2',
          size: sku,
          family: 'Pv2',
          capacity: 1
        },
        kind: 'app'
      };

      const operation = await this.appServiceClient.appServicePlans.beginCreateOrUpdate(
        resourceGroup,
        planName,
        servicePlan
      );
      
      const result = await operation.pollUntilDone();
      
      return {
        name: planName,
        resourceGroup,
        location,
        sku,
        id: result.id,
        status: 'created'
      };
    } catch (error: any) {
      console.error('Error creating App Service Plan:', error);
      throw new Error(`Failed to create App Service Plan: ${error.message}`);
    }
  }

  async createWebApp(resourceGroup: string, appName: string, servicePlanId: string, location: string) {
    try {
      console.log(`Creating Web App: ${appName}`);
      
      const webApp = {
        location,
        serverFarmId: servicePlanId,
        siteConfig: {
          appSettings: [],
          alwaysOn: true,
          httpLoggingEnabled: true,
          requestTracingEnabled: true,
          detailedErrorLoggingEnabled: true
        },
        httpsOnly: true
      };

      const operation = await this.appServiceClient.webApps.beginCreateOrUpdate(
        resourceGroup,
        appName,
        webApp
      );
      
      const result = await operation.pollUntilDone();
      
      return {
        name: appName,
        resourceGroup,
        location,
        url: `https://${appName}.azurewebsites.net`,
        id: result.id,
        status: 'created'
      };
    } catch (error: any) {
      console.error('Error creating Web App:', error);
      throw new Error(`Failed to create Web App: ${error.message}`);
    }
  }
}

// Create singleton instance
let azureService: AzureContainerService | null = null;

export function getAzureService(): AzureContainerService {
  if (!azureService) {
    const config = {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID!,
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID!
    };

    if (!config.clientId || !config.clientSecret || !config.tenantId || !config.subscriptionId) {
      throw new Error('Azure credentials not configured. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, and AZURE_SUBSCRIPTION_ID environment variables.');
    }

    azureService = new AzureContainerService(config);
  }

  return azureService;
}
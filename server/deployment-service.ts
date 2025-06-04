import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAzureService } from './azure-service';

interface DeploymentRequest {
  code: string;
  codeType: 'terraform' | 'pulumi';
  provider: 'azure' | 'aws' | 'gcp';
  resourceType: string;
  deploymentId: string;
}

interface DeploymentResult {
  deploymentId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  outputs?: Record<string, any>;
  error?: string;
  logs: string[];
}

export class DeploymentService {
  private deployments = new Map<string, DeploymentResult>();
  private deploymentsDir = join(process.cwd(), 'deployments');

  constructor() {
    this.ensureDeploymentsDir();
  }

  private async ensureDeploymentsDir() {
    try {
      await fs.mkdir(this.deploymentsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create deployments directory:', error);
    }
  }

  async deployInfrastructure(request: DeploymentRequest): Promise<string> {
    const deploymentId = uuidv4();
    const deploymentPath = join(this.deploymentsDir, deploymentId);
    
    try {
      await fs.mkdir(deploymentPath, { recursive: true });
      
      // Initialize deployment status
      this.deployments.set(deploymentId, {
        deploymentId,
        status: 'pending',
        logs: ['Deployment initiated']
      });

      if (request.codeType === 'terraform') {
        await this.deployTerraform(deploymentId, deploymentPath, request);
      } else {
        await this.deployPulumi(deploymentId, deploymentPath, request);
      }

      return deploymentId;
    } catch (error: any) {
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
      throw error;
    }
  }

  private async deployTerraform(deploymentId: string, deploymentPath: string, request: DeploymentRequest) {
    this.addLog(deploymentId, 'Writing Terraform configuration...');
    
    // Write main.tf file
    const tfFile = join(deploymentPath, 'main.tf');
    await fs.writeFile(tfFile, request.code);

    // Write terraform.tfvars for Azure credentials
    if (request.provider === 'azure') {
      const tfvarsContent = this.generateTerraformVars('azure');
      await fs.writeFile(join(deploymentPath, 'terraform.tfvars'), tfvarsContent);
    }

    this.updateDeploymentStatus(deploymentId, 'running');
    this.addLog(deploymentId, 'Initializing Terraform...');

    // Execute terraform commands
    await this.execCommand('terraform init', deploymentPath, deploymentId);
    this.addLog(deploymentId, 'Planning Terraform deployment...');
    
    await this.execCommand('terraform plan', deploymentPath, deploymentId);
    this.addLog(deploymentId, 'Applying Terraform configuration...');
    
    const applyOutput = await this.execCommand('terraform apply -auto-approve', deploymentPath, deploymentId);
    
    // Get outputs
    const outputsJson = await this.execCommand('terraform output -json', deploymentPath, deploymentId);
    let outputs = {};
    try {
      outputs = JSON.parse(outputsJson);
    } catch (e) {
      this.addLog(deploymentId, 'Could not parse Terraform outputs');
    }

    this.updateDeploymentStatus(deploymentId, 'success');
    this.addLog(deploymentId, 'Deployment completed successfully!');
    
    const deployment = this.deployments.get(deploymentId)!;
    deployment.outputs = outputs;
  }

  private async deployPulumi(deploymentId: string, deploymentPath: string, request: DeploymentRequest) {
    this.addLog(deploymentId, 'Writing Pulumi configuration...');
    
    // Write index.ts file
    const pulumiFile = join(deploymentPath, 'index.ts');
    await fs.writeFile(pulumiFile, request.code);

    // Write package.json
    const packageJson = {
      name: `deployment-${deploymentId}`,
      main: "index.ts",
      dependencies: {
        "@pulumi/pulumi": "^3.0.0",
        "@pulumi/azure-native": "^2.0.0"
      }
    };
    await fs.writeFile(join(deploymentPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create Pulumi.yaml
    const pulumiYaml = `name: deployment-${deploymentId}
runtime: nodejs
description: Infrastructure deployment via Instanti8.dev`;
    await fs.writeFile(join(deploymentPath, 'Pulumi.yaml'), pulumiYaml);

    this.updateDeploymentStatus(deploymentId, 'running');
    this.addLog(deploymentId, 'Installing Pulumi dependencies...');

    await this.execCommand('npm install', deploymentPath, deploymentId);
    this.addLog(deploymentId, 'Initializing Pulumi stack...');
    
    await this.execCommand(`pulumi stack init ${deploymentId}`, deploymentPath, deploymentId);
    
    // Set Azure configuration
    if (request.provider === 'azure') {
      const azureConfig = this.getAzureConfig();
      await this.execCommand(`pulumi config set azure-native:clientId ${azureConfig.clientId}`, deploymentPath, deploymentId);
      await this.execCommand(`pulumi config set azure-native:clientSecret ${azureConfig.clientSecret} --secret`, deploymentPath, deploymentId);
      await this.execCommand(`pulumi config set azure-native:tenantId ${azureConfig.tenantId}`, deploymentPath, deploymentId);
      await this.execCommand(`pulumi config set azure-native:subscriptionId ${azureConfig.subscriptionId}`, deploymentPath, deploymentId);
    }

    this.addLog(deploymentId, 'Deploying Pulumi stack...');
    await this.execCommand('pulumi up --yes', deploymentPath, deploymentId);

    // Get stack outputs
    const outputsJson = await this.execCommand('pulumi stack output --json', deploymentPath, deploymentId);
    let outputs = {};
    try {
      outputs = JSON.parse(outputsJson);
    } catch (e) {
      this.addLog(deploymentId, 'Could not parse Pulumi outputs');
    }

    this.updateDeploymentStatus(deploymentId, 'success');
    this.addLog(deploymentId, 'Deployment completed successfully!');
    
    const deployment = this.deployments.get(deploymentId)!;
    deployment.outputs = outputs;
  }

  private async execCommand(command: string, cwd: string, deploymentId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.addLog(deploymentId, `Executing: ${command}`);
      
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          this.addLog(deploymentId, `Error: ${error.message}`);
          this.updateDeploymentStatus(deploymentId, 'failed', error.message);
          reject(error);
          return;
        }
        
        if (stderr) {
          this.addLog(deploymentId, `Warning: ${stderr}`);
        }
        
        if (stdout) {
          this.addLog(deploymentId, stdout);
        }
        
        resolve(stdout);
      });
    });
  }

  private generateTerraformVars(provider: string): string {
    if (provider === 'azure') {
      const azureConfig = this.getAzureConfig();
      return `# Azure Configuration
client_id       = "${azureConfig.clientId}"
client_secret   = "${azureConfig.clientSecret}"
tenant_id      = "${azureConfig.tenantId}"
subscription_id = "${azureConfig.subscriptionId}"`;
    }
    return '';
  }

  private getAzureConfig() {
    return {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID!,
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID!
    };
  }

  private updateDeploymentStatus(deploymentId: string, status: DeploymentResult['status'], error?: string) {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.status = status;
      if (error) {
        deployment.error = error;
      }
    }
  }

  private addLog(deploymentId: string, message: string) {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.logs.push(`${new Date().toISOString()}: ${message}`);
    }
  }

  getDeploymentStatus(deploymentId: string): DeploymentResult | undefined {
    return this.deployments.get(deploymentId);
  }

  async destroyInfrastructure(deploymentId: string): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const deploymentPath = join(this.deploymentsDir, deploymentId);
    
    this.addLog(deploymentId, 'Destroying infrastructure...');
    this.updateDeploymentStatus(deploymentId, 'running');

    try {
      // Check if it's a Terraform or Pulumi deployment
      const tfFile = join(deploymentPath, 'main.tf');
      const pulumiFile = join(deploymentPath, 'Pulumi.yaml');
      
      if (await this.fileExists(tfFile)) {
        await this.execCommand('terraform destroy -auto-approve', deploymentPath, deploymentId);
      } else if (await this.fileExists(pulumiFile)) {
        await this.execCommand('pulumi destroy --yes', deploymentPath, deploymentId);
      }

      this.addLog(deploymentId, 'Infrastructure destroyed successfully');
      this.updateDeploymentStatus(deploymentId, 'success');
    } catch (error: any) {
      this.addLog(deploymentId, `Destroy failed: ${error.message}`);
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getAllDeployments(): DeploymentResult[] {
    return Array.from(this.deployments.values());
  }
}

export const deploymentService = new DeploymentService();
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertChatMessageSchema, insertDeploymentSchema } from "@shared/schema";
import { z } from "zod";
import { getAzureService } from "./azure-service";
import { codeGenerator } from "./code-generator";
import { deploymentService } from "./deployment-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // API Routes
  
  // Get current user (mock authentication)
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(1); // Mock user ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Get user projects
  app.get("/api/projects", async (req, res) => {
    const projects = await storage.getProjectsByUserId(1); // Mock user ID
    res.json(projects);
  });

  // Get all deployments
  app.get("/api/deployments", async (req, res) => {
    const deployments = await storage.getAllDeployments();
    res.json(deployments);
  });

  // Create new deployment
  app.post("/api/deployments", async (req, res) => {
    try {
      const validatedData = insertDeploymentSchema.parse(req.body);
      const deployment = await storage.createDeployment(validatedData);
      
      // Simulate deployment process
      setTimeout(async () => {
        await storage.updateDeploymentStatus(deployment.id, "running");
      }, 5000);

      res.json(deployment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deployment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  // Get deployment stats
  app.get("/api/stats", async (req, res) => {
    const deployments = await storage.getAllDeployments();
    const projects = await storage.getProjectsByUserId(1);
    
    const runningDeployments = deployments.filter(d => d.status === "running").length;
    const totalCost = deployments.reduce((sum, d) => sum + (d.cost || 0), 0);
    const uptime = 99.9; // Mock uptime percentage
    
    res.json({
      deployments: runningDeployments,
      providers: 3,
      cost: Math.round(totalCost / 100), // Convert cents to dollars
      uptime: uptime,
      projects: projects.length
    });
  });

  // WebSocket chat handling
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to chat');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat-message') {
          // Store the message
          const chatMessage = await storage.createChatMessage({
            userId: 1, // Mock user ID
            message: message.message
          });

          // Generate AI response
          const response = await generateChatResponse(message.message);
          
          // Update with response
          await storage.updateChatResponse(chatMessage.id, response.message);

          // Send response back to client
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat-response',
              message: response.message,
              code: response.code,
              codeType: response.codeType,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from chat');
    });
  });

  // Azure Docker Container endpoints
  app.get("/api/azure/containers", async (req, res) => {
    try {
      // In production, this would call Azure Container Instances API
      // For now, we'll simulate real Azure container data structure
      const containers = [
        {
          id: "aci-instanti8-web-001",
          name: "instanti8-web",
          image: "nginx:latest",
          status: "running",
          resourceGroup: "instanti8-rg",
          location: "eastus",
          cpu: 1,
          memory: 1,
          ports: [80],
          publicIp: "20.119.45.123",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "aci-instanti8-api-002",
          name: "instanti8-api",
          image: "node:18-alpine",
          status: "pending",
          resourceGroup: "instanti8-rg", 
          location: "westus2",
          cpu: 2,
          memory: 2,
          ports: [3000, 8080],
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      res.json(containers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch containers from Azure" });
    }
  });

  app.post("/api/azure/containers", async (req, res) => {
    try {
      const {
        name,
        image,
        resourceGroup,
        location,
        cpu,
        memory,
        ports,
        environmentVariables,
        command
      } = req.body;

      // Validate required fields
      if (!name || !image || !resourceGroup || !location) {
        return res.status(400).json({ 
          message: "Missing required fields: name, image, resourceGroup, location" 
        });
      }

      // Real Azure Container Instance deployment
      const azureService = getAzureService();
      
      const containerSpec = {
        name,
        image,
        resourceGroup,
        location,
        cpu: cpu || 1,
        memory: memory || 1,
        ports: ports || [80],
        environmentVariables,
        command
      };

      const deploymentResult = await azureService.createContainer(containerSpec);

      res.status(201).json(deploymentResult);
    } catch (error: any) {
      console.error("Azure container deployment error:", error);
      res.status(500).json({ 
        message: "Failed to deploy container to Azure", 
        error: error.message 
      });
    }
  });

  app.get("/api/azure/containers/:resourceGroup/:name", async (req, res) => {
    try {
      const azureService = getAzureService();
      const { resourceGroup, name } = req.params;
      
      const container = await azureService.getContainer(resourceGroup, name);
      res.json(container);
    } catch (error: any) {
      console.error("Error getting Azure container:", error);
      res.status(500).json({ error: error.message || "Failed to get container" });
    }
  });

  app.post("/api/azure/containers/:resourceGroup/:name/stop", async (req, res) => {
    try {
      const azureService = getAzureService();
      const { resourceGroup, name } = req.params;
      
      const result = await azureService.stopContainer(resourceGroup, name);
      res.json(result);
    } catch (error: any) {
      console.error("Error stopping Azure container:", error);
      res.status(500).json({ error: error.message || "Failed to stop container" });
    }
  });

  app.post("/api/azure/containers/:resourceGroup/:name/restart", async (req, res) => {
    try {
      const azureService = getAzureService();
      const { resourceGroup, name } = req.params;
      
      const result = await azureService.restartContainer(resourceGroup, name);
      res.json(result);
    } catch (error: any) {
      console.error("Error restarting Azure container:", error);
      res.status(500).json({ error: error.message || "Failed to restart container" });
    }
  });

  app.delete("/api/azure/containers/:resourceGroup/:name", async (req, res) => {
    try {
      const azureService = getAzureService();
      const { resourceGroup, name } = req.params;
      
      const result = await azureService.deleteContainer(resourceGroup, name);
      res.json(result);
    } catch (error: any) {
      console.error("Error deleting Azure container:", error);
      res.status(500).json({ error: error.message || "Failed to delete container" });
    }
  });

  // Deployment API routes
  app.post("/api/deploy", async (req, res) => {
    try {
      const { code, codeType, provider, resourceType } = req.body;
      
      if (!code || !codeType || !provider) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const deploymentId = await deploymentService.deployInfrastructure({
        code,
        codeType,
        provider,
        resourceType,
        deploymentId: ""
      });

      res.json({ deploymentId, status: "initiated" });
    } catch (error: any) {
      console.error("Deployment error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deploy/:deploymentId/status", async (req, res) => {
    try {
      const { deploymentId } = req.params;
      const deployment = deploymentService.getDeploymentStatus(deploymentId);
      
      if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
      }

      res.json(deployment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/deploy/:deploymentId", async (req, res) => {
    try {
      const { deploymentId } = req.params;
      await deploymentService.destroyInfrastructure(deploymentId);
      res.json({ message: "Infrastructure destruction initiated" });
    } catch (error: any) {
      console.error("Destroy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deployments", async (req, res) => {
    try {
      const deployments = deploymentService.getAllDeployments();
      res.json(deployments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

async function generateChatResponse(message: string): Promise<{ message: string; code?: string; codeType?: string }> {
  const lowercaseMessage = message.toLowerCase();
  
  try {
    // Check if this is a deployment request that should generate code
    if (lowercaseMessage.includes("deploy") || lowercaseMessage.includes("create") || lowercaseMessage.includes("setup")) {
      const provider = codeGenerator.determineProvider(message);
      const resourceType = codeGenerator.determineResourceType(message);
      
      // Generate Infrastructure-as-Code
      const terraformCode = codeGenerator.generateTerraform({
        prompt: message,
        provider,
        resourceType,
        codeType: 'terraform'
      });
      
      const pulumiCode = codeGenerator.generatePulumi({
        prompt: message,
        provider,
        resourceType,
        codeType: 'pulumi'
      });
      
      return {
        message: `I've generated Infrastructure-as-Code for your request: "${message}"\n\n${terraformCode.description}\n\nResources created:\n${terraformCode.resources.map(r => `• ${r}`).join('\n')}\n\nThe code is ready for deployment. You can switch between Terraform and Pulumi formats in the Code tab.`,
        code: terraformCode.code,
        codeType: 'terraform'
      };
    }
    
    // Azure deployment commands
    if (lowercaseMessage.includes("deploy") && lowercaseMessage.includes("azure")) {
      if (lowercaseMessage.includes("nginx") || lowercaseMessage.includes("web")) {
        return { message: "I'll generate Infrastructure-as-Code for an nginx web server on Azure Container Instances.\n\nPlease provide:\n• Resource group name\n• Azure region (e.g., 'East US', 'West Europe')\n• Container name\n\nExample: 'Deploy nginx to my-rg in East US named web-server'" };
      }
      return { message: "I can generate Infrastructure-as-Code for Azure deployments! What would you like to deploy?\n\n• nginx web server\n• node.js application\n• postgres database\n• kubernetes cluster\n• storage account\n• virtual network\n\nTry: 'deploy nginx to azure'" };
    }
    
    // List containers
    if (lowercaseMessage.includes("list") || lowercaseMessage.includes("show containers")) {
      try {
        const azureService = getAzureService();
        const containers = await azureService.listContainers();
        
        if (containers.length === 0) {
          return { message: "No Azure containers found in your subscription.\n\nWould you like to deploy one? Try: 'deploy nginx to azure'" };
        }
        
        let response = "Your Azure Container Instances:\n\n";
        containers.forEach(container => {
          response += `• ${container.name} (${container.status})\n  Image: ${container.image}\n  Location: ${container.location}\n  IP: ${container.publicIp || 'Not assigned'}\n\n`;
        });
        
        return { message: response };
      } catch (error: any) {
        return { message: `Error fetching containers: ${error.message}\n\nPlease ensure your Azure credentials are configured in Settings.` };
      }
    }
    
    // Status check
    if (lowercaseMessage.includes("status") || lowercaseMessage.includes("check")) {
      try {
        const azureService = getAzureService();
        const containers = await azureService.listContainers();
        
        const running = containers.filter(c => c.status === 'running').length;
        const stopped = containers.filter(c => c.status === 'stopped').length;
        const pending = containers.filter(c => c.status === 'pending').length;
        
        return { message: `Azure Infrastructure Status:\n\n• Running: ${running} containers\n• Stopped: ${stopped} containers\n• Pending: ${pending} containers\n• Total: ${containers.length} containers\n\nNeed details on a specific container? Ask: 'show logs for [container-name]'` };
      } catch (error: any) {
        return { message: `Cannot check status: ${error.message}\n\nPlease verify your Azure credentials in Settings.` };
      }
    }
    
    // Container management
    if (lowercaseMessage.includes("stop") && lowercaseMessage.includes("container")) {
      return { message: "I can stop Azure containers for you.\n\nPlease specify:\n• Container name\n• Resource group\n\nExample: 'stop container web-server in my-rg'" };
    }
    
    if (lowercaseMessage.includes("delete") || lowercaseMessage.includes("remove")) {
      return { message: "I can delete Azure containers.\n\nPlease specify:\n• Container name\n• Resource group\n\nExample: 'delete container web-server in my-rg'\n\nWarning: This action cannot be undone." };
    }
    
    // Logs
    if (lowercaseMessage.includes("logs") || lowercaseMessage.includes("debug")) {
      return { message: "I can retrieve container logs for debugging.\n\nPlease specify:\n• Container name\n• Resource group\n\nExample: 'show logs for web-server in my-rg'" };
    }
    
    // Help
    if (lowercaseMessage.includes("help")) {
      return { message: "Azure Cloud Assistant Commands:\n\n• 'deploy nginx to azure' - Deploy web server\n• 'create postgres database' - Set up database\n• 'setup storage account' - Configure storage\n• 'create kubernetes cluster' - Set up AKS\n• 'list containers' - Show all containers\n• 'check status' - Infrastructure overview\n\nI generate Terraform and Pulumi code for your infrastructure!" };
    }
    
    // Greetings
    if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
      return { message: "Hello! I'm your Infrastructure-as-Code assistant.\n\nI generate Terraform and Pulumi code from your natural language requests.\n\nTry: 'deploy nginx to azure' or 'create postgres database'" };
    }
    
    // Default
    return { message: "I generate Infrastructure-as-Code from your requests!\n\nTry:\n• 'deploy nginx to azure'\n• 'create postgres database'\n• 'setup storage account'\n• 'create kubernetes cluster'\n• 'help' for more commands\n\nWhat infrastructure would you like to create?" };
    
  } catch (error: any) {
    return { message: `Error processing request: ${error.message}` };
  }
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertChatMessageSchema, insertDeploymentSchema } from "@shared/schema";
import { z } from "zod";
import { getAzureService } from "./azure-service";

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
        
        if (message.type === 'chat_message') {
          // Store the message
          const chatMessage = await storage.createChatMessage({
            userId: 1, // Mock user ID
            message: message.content
          });

          // Generate AI response
          const response = await generateChatResponse(message.content.toLowerCase());
          
          // Update with response
          await storage.updateChatResponse(chatMessage.id, response);

          // Send response back to client
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_response',
              message: response,
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

  return httpServer;
}

async function generateChatResponse(message: string): Promise<string> {
  const lowercaseMessage = message.toLowerCase();
  
  try {
    // Azure deployment commands
    if (lowercaseMessage.includes("deploy") && lowercaseMessage.includes("azure")) {
      if (lowercaseMessage.includes("nginx") || lowercaseMessage.includes("web")) {
        return "I'll deploy an nginx web server to Azure Container Instances.\n\nPlease provide:\n• Resource group name\n• Azure region (e.g., 'East US', 'West Europe')\n• Container name\n\nExample: 'Deploy nginx to my-rg in East US named web-server'";
      }
      return "I can deploy to Azure Container Instances! What would you like to deploy?\n\n• nginx web server\n• node.js application\n• postgres database\n• custom docker image\n\nTry: 'deploy nginx to azure'";
    }
    
    // List containers
    if (lowercaseMessage.includes("list") || lowercaseMessage.includes("show containers")) {
      try {
        const azureService = getAzureService();
        const containers = await azureService.listContainers();
        
        if (containers.length === 0) {
          return "No Azure containers found in your subscription.\n\nWould you like to deploy one? Try: 'deploy nginx to azure'";
        }
        
        let response = "Your Azure Container Instances:\n\n";
        containers.forEach(container => {
          response += `• ${container.name} (${container.status})\n  Image: ${container.image}\n  Location: ${container.location}\n  IP: ${container.publicIp || 'Not assigned'}\n\n`;
        });
        
        return response;
      } catch (error: any) {
        return `Error fetching containers: ${error.message}\n\nPlease ensure your Azure credentials are configured in Settings.`;
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
        
        return `Azure Infrastructure Status:\n\n• Running: ${running} containers\n• Stopped: ${stopped} containers\n• Pending: ${pending} containers\n• Total: ${containers.length} containers\n\nNeed details on a specific container? Ask: 'show logs for [container-name]'`;
      } catch (error: any) {
        return `Cannot check status: ${error.message}\n\nPlease verify your Azure credentials in Settings.`;
      }
    }
    
    // Container management
    if (lowercaseMessage.includes("stop") && lowercaseMessage.includes("container")) {
      return "I can stop Azure containers for you.\n\nPlease specify:\n• Container name\n• Resource group\n\nExample: 'stop container web-server in my-rg'";
    }
    
    if (lowercaseMessage.includes("delete") || lowercaseMessage.includes("remove")) {
      return "I can delete Azure containers.\n\nPlease specify:\n• Container name\n• Resource group\n\nExample: 'delete container web-server in my-rg'\n\nWarning: This action cannot be undone.";
    }
    
    // Logs
    if (lowercaseMessage.includes("logs") || lowercaseMessage.includes("debug")) {
      return "I can retrieve container logs for debugging.\n\nPlease specify:\n• Container name\n• Resource group\n\nExample: 'show logs for web-server in my-rg'";
    }
    
    // Help
    if (lowercaseMessage.includes("help")) {
      return "Azure Cloud Assistant Commands:\n\n• 'deploy nginx to azure' - Deploy web server\n• 'list containers' - Show all containers\n• 'check status' - Infrastructure overview\n• 'stop container [name] in [rg]' - Stop container\n• 'delete container [name] in [rg]' - Delete container\n• 'show logs for [name] in [rg]' - View logs\n\nReady to deploy something?";
    }
    
    // Greetings
    if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
      return "Hello! I'm your Azure deployment assistant.\n\nI can help you deploy and manage containers on Azure.\n\nTry: 'deploy nginx to azure' or 'list containers'";
    }
    
    // Default
    return "I can help manage your Azure infrastructure through chat!\n\nTry:\n• 'deploy nginx to azure'\n• 'list my containers'\n• 'check status'\n• 'help' for more commands\n\nWhat would you like to do?";
    
  } catch (error: any) {
    return `Error processing request: ${error.message}`;
  }
}

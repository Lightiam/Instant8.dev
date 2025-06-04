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
          const response = generateChatResponse(message.content.toLowerCase());
          
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

function generateChatResponse(message: string): string {
  const responses: Record<string, string> = {
    'deploy to aws': '🚀 Starting AWS deployment...\n\n✅ Creating EC2 instances\n✅ Setting up Load Balancer\n✅ Configuring RDS database\n\n📋 Deployment will be ready in ~5 minutes. You can monitor progress in the Deployments section.',
    'deploy to azure': '🚀 Initiating Azure deployment...\n\n✅ Provisioning App Services\n✅ Creating SQL Database\n✅ Setting up Blob Storage\n\n📋 Azure deployment in progress. ETA: 7 minutes.',
    'deploy to gcp': '🚀 Starting Google Cloud deployment...\n\n✅ Creating Compute Engine instances\n✅ Setting up Cloud SQL\n✅ Configuring Cloud Storage\n\n📋 GCP deployment initiated successfully.',
    'check status': '📊 **Deployment Status**\n\n🟢 AWS Production: Running (99.9% uptime)\n🟡 Azure Staging: Deploying (76% complete)\n🟢 GCP Analytics: Running (100% uptime)\n\n💰 Total monthly cost: $847',
    'show logs': '📄 **Recent Deployment Logs**\n\n```\n[2024-01-15 14:32:15] AWS: Instance i-1234abcd started\n[2024-01-15 14:31:22] Azure: App service deployment 76% complete\n[2024-01-15 14:30:45] GCP: Health check passed\n[2024-01-15 14:29:12] AWS: Load balancer healthy\n```',
    'help': '❓ **Available Commands**\n\n• `deploy to [aws|azure|gcp]` - Start new deployment\n• `check status` - View all deployment statuses\n• `show logs` - Display recent logs\n• `monitor [service]` - Show monitoring data\n• `scale [service] [count]` - Scale infrastructure\n• `rollback [deployment]` - Rollback deployment',
    'monitor': '📈 **Infrastructure Monitoring**\n\n**AWS Production:**\n- CPU: 45% avg\n- Memory: 67% avg\n- Network: 12 MB/s\n\n**Azure Staging:**\n- Response time: 245ms\n- Requests/min: 1,247\n- Error rate: 0.02%',
    'cost': '💰 **Cost Breakdown**\n\n**AWS:** $324/month\n- EC2: $189\n- RDS: $95\n- ALB: $40\n\n**Azure:** $298/month\n- App Services: $167\n- SQL Database: $89\n- Storage: $42\n\n**GCP:** $225/month\n- Compute: $134\n- BigQuery: $67\n- Storage: $24'
  };

  // Check for specific keywords
  for (const key in responses) {
    if (message.includes(key)) {
      return responses[key];
    }
  }

  return "I can help you with:\n\n• Deploy to cloud providers\n• Check deployment status\n• Monitor infrastructure\n• View logs and metrics\n• Manage costs\n\nTry asking: 'deploy to AWS' or 'check status'";
}

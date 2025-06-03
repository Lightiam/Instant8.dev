import { 
  users, projects, deployments, chatMessages,
  type User, type InsertUser,
  type Project, type InsertProject,
  type Deployment, type InsertDeployment,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Deployments
  getDeploymentsByProjectId(projectId: number): Promise<Deployment[]>;
  getAllDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeploymentStatus(id: number, status: string): Promise<Deployment | undefined>;

  // Chat Messages
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatResponse(id: number, response: string): Promise<ChatMessage | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getDeploymentsByProjectId(projectId: number): Promise<Deployment[]> {
    return await db.select().from(deployments).where(eq(deployments.projectId, projectId));
  }

  async getAllDeployments(): Promise<Deployment[]> {
    return await db.select().from(deployments);
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment || undefined;
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const [deployment] = await db
      .insert(deployments)
      .values(insertDeployment)
      .returning();
    return deployment;
  }

  async updateDeploymentStatus(id: number, status: string): Promise<Deployment | undefined> {
    const [deployment] = await db
      .update(deployments)
      .set({ status, lastDeployedAt: new Date() })
      .where(eq(deployments.id, id))
      .returning();
    return deployment || undefined;
  }

  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateChatResponse(id: number, response: string): Promise<ChatMessage | undefined> {
    const [message] = await db
      .update(chatMessages)
      .set({ response })
      .where(eq(chatMessages.id, id))
      .returning();
    return message || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private deployments: Map<number, Deployment> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private currentUserId = 1;
  private currentProjectId = 1;
  private currentDeploymentId = 1;
  private currentChatId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const user: User = {
      id: this.currentUserId++,
      username: "john.developer",
      password: "password123",
      email: "john@company.com",
      name: "John Developer",
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Create sample projects
    const project1: Project = {
      id: this.currentProjectId++,
      name: "Production API",
      description: "Main production API service",
      userId: user.id,
      status: "active",
      createdAt: new Date(),
    };
    this.projects.set(project1.id, project1);

    const project2: Project = {
      id: this.currentProjectId++,
      name: "Frontend App",
      description: "React frontend application",
      userId: user.id,
      status: "active",
      createdAt: new Date(),
    };
    this.projects.set(project2.id, project2);

    const project3: Project = {
      id: this.currentProjectId++,
      name: "Analytics Service",
      description: "Data analytics and reporting",
      userId: user.id,
      status: "active",
      createdAt: new Date(),
    };
    this.projects.set(project3.id, project3);

    // Create sample deployments
    const deployment1: Deployment = {
      id: this.currentDeploymentId++,
      name: "Production API",
      projectId: project1.id,
      provider: "aws",
      region: "us-east-1",
      status: "running",
      configuration: {
        instances: 3,
        instanceType: "t3.medium",
        database: "RDS MySQL",
        loadBalancer: "ALB"
      },
      cost: 32400, // $324.00
      lastDeployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    };
    this.deployments.set(deployment1.id, deployment1);

    const deployment2: Deployment = {
      id: this.currentDeploymentId++,
      name: "Frontend App",
      projectId: project2.id,
      provider: "azure",
      region: "East US",
      status: "deploying",
      configuration: {
        appServices: 2,
        database: "SQL Database Premium",
        storage: "Blob Storage"
      },
      cost: 29800, // $298.00
      lastDeployedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    };
    this.deployments.set(deployment2.id, deployment2);

    const deployment3: Deployment = {
      id: this.currentDeploymentId++,
      name: "Analytics Service",
      projectId: project3.id,
      provider: "gcp",
      region: "us-central1",
      status: "running",
      configuration: {
        computeEngine: "2 n1-standard",
        bigQuery: "1 Dataset",
        storage: "Cloud Storage Multi-region"
      },
      cost: 22500, // $225.00
      lastDeployedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };
    this.deployments.set(deployment3.id, deployment3);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Projects
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date(),
      description: insertProject.description || null,
      status: insertProject.status || "active"
    };
    this.projects.set(id, project);
    return project;
  }

  // Deployments
  async getDeploymentsByProjectId(projectId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).filter(deployment => deployment.projectId === projectId);
  }

  async getAllDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values());
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const id = this.currentDeploymentId++;
    const deployment: Deployment = { 
      ...insertDeployment, 
      id, 
      createdAt: new Date(),
      lastDeployedAt: new Date(),
      cost: insertDeployment.cost || null,
      status: insertDeployment.status || "pending",
      configuration: insertDeployment.configuration || null
    };
    this.deployments.set(id, deployment);
    return deployment;
  }

  async updateDeploymentStatus(id: number, status: string): Promise<Deployment | undefined> {
    const deployment = this.deployments.get(id);
    if (deployment) {
      deployment.status = status;
      deployment.lastDeployedAt = new Date();
      this.deployments.set(id, deployment);
    }
    return deployment;
  }

  // Chat Messages
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(message => message.userId === userId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp: new Date(),
      response: null
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async updateChatResponse(id: number, response: string): Promise<ChatMessage | undefined> {
    const message = this.chatMessages.get(id);
    if (message) {
      message.response = response;
      this.chatMessages.set(id, message);
    }
    return message;
  }
}

export const storage = new DatabaseStorage();

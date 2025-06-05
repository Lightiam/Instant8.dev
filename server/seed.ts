import { db } from "./db";
import { users, projects, deployments } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded");
      return;
    }

    // Create default user
    const [user] = await db.insert(users).values({
      username: "john.developer",
      password: "password123",
      email: "john@company.com",
      name: "John Developer"
    }).returning();

    // Create sample projects
    const [project1] = await db.insert(projects).values({
      name: "Production API",
      description: "Main production API service",
      userId: user.id,
      status: "active"
    }).returning();

    const [project2] = await db.insert(projects).values({
      name: "Frontend App",
      description: "React frontend application",
      userId: user.id,
      status: "active"
    }).returning();

    const [project3] = await db.insert(projects).values({
      name: "Analytics Service",
      description: "Data analytics and reporting",
      userId: user.id,
      status: "active"
    }).returning();

    // Create sample deployments
    await db.insert(deployments).values([
      {
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
        cost: 32400,
        lastDeployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
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
        cost: 29800,
        lastDeployedAt: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
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
        cost: 22500,
        lastDeployedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
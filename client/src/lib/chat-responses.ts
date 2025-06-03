export const chatResponses: Record<string, string> = {
  'deploy to aws': '🚀 Starting AWS deployment...\n\n✅ Creating EC2 instances\n✅ Setting up Load Balancer\n✅ Configuring RDS database\n\n📋 Deployment will be ready in ~5 minutes. You can monitor progress in the Deployments section.',
  'deploy to azure': '🚀 Initiating Azure deployment...\n\n✅ Provisioning App Services\n✅ Creating SQL Database\n✅ Setting up Blob Storage\n\n📋 Azure deployment in progress. ETA: 7 minutes.',
  'deploy to gcp': '🚀 Starting Google Cloud deployment...\n\n✅ Creating Compute Engine instances\n✅ Setting up Cloud SQL\n✅ Configuring Cloud Storage\n\n📋 GCP deployment initiated successfully.',
  'check status': '📊 **Deployment Status**\n\n🟢 AWS Production: Running (99.9% uptime)\n🟡 Azure Staging: Deploying (76% complete)\n🟢 GCP Analytics: Running (100% uptime)\n\n💰 Total monthly cost: $847',
  'show logs': '📄 **Recent Deployment Logs**\n\n```\n[2024-01-15 14:32:15] AWS: Instance i-1234abcd started\n[2024-01-15 14:31:22] Azure: App service deployment 76% complete\n[2024-01-15 14:30:45] GCP: Health check passed\n[2024-01-15 14:29:12] AWS: Load balancer healthy\n```',
  'help': '❓ **Available Commands**\n\n• `deploy to [aws|azure|gcp]` - Start new deployment\n• `check status` - View all deployment statuses\n• `show logs` - Display recent logs\n• `monitor [service]` - Show monitoring data\n• `scale [service] [count]` - Scale infrastructure\n• `rollback [deployment]` - Rollback deployment',
  'monitor': '📈 **Infrastructure Monitoring**\n\n**AWS Production:**\n- CPU: 45% avg\n- Memory: 67% avg\n- Network: 12 MB/s\n\n**Azure Staging:**\n- Response time: 245ms\n- Requests/min: 1,247\n- Error rate: 0.02%',
  'cost': '💰 **Cost Breakdown**\n\n**AWS:** $324/month\n- EC2: $189\n- RDS: $95\n- ALB: $40\n\n**Azure:** $298/month\n- App Services: $167\n- SQL Database: $89\n- Storage: $42\n\n**GCP:** $225/month\n- Compute: $134\n- BigQuery: $67\n- Storage: $24'
};

export function getChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, response] of Object.entries(chatResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return "I can help you with:\n\n• Deploy to cloud providers\n• Check deployment status\n• Monitor infrastructure\n• View logs and metrics\n• Manage costs\n\nTry asking: 'deploy to AWS' or 'check status'";
}

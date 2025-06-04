# </> Instanti8.dev

A multi-cloud Infrastructure as Code deployment platform featuring conversational AI for generating and deploying Terraform/Pulumi code directly to AWS, Azure, and Google Cloud Platform.

## 🚀 Features

- **Conversational Infrastructure**: Generate Terraform/Pulumi code through natural language prompts
- **Multi-Cloud Support**: Deploy to Azure, AWS, and GCP with unified interface
- **Real-time Deployment**: Monitor infrastructure provisioning with live status updates
- **SaaS Provider Model**: Simplified deployment without complex cloud permission setup
- **Professional UI**: Modern dashboard with conversation starters and deployment management

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + WebSocket for real-time updates
- **Database**: PostgreSQL with Drizzle ORM
- **Infrastructure**: Azure Resource Manager, Terraform, Pulumi
- **Authentication**: Azure Active Directory integration

## 📦 Deployment to Netlify

### Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Database**: PostgreSQL database (recommended: Neon, Supabase, or Railway)
3. **Azure Credentials**: Azure App Registration for cloud deployments

### Step 1: Environment Variables

Configure these environment variables in Netlify:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Azure Service Provider Credentials
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_SUBSCRIPTION_ID=your-azure-subscription-id

# Node Environment
NODE_ENV=production
```

### Step 2: Build Configuration

Create `netlify.toml` in project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### Step 3: Netlify Functions Setup

Create `netlify/functions/server.js`:

```javascript
const { createServer } = require('./../../server/index.js');
const serverless = require('serverless-http');

const app = createServer();
module.exports.handler = serverless(app);
```

### Step 4: Package.json Scripts

Add build scripts to `package.json`:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc server/**/*.ts --outDir netlify/functions --target es2020",
    "preview": "vite preview",
    "deploy": "netlify deploy --prod"
  }
}
```

### Step 5: Database Migration

Run database setup before deployment:

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed database (optional)
npm run db:seed
```

### Step 6: Deploy to Netlify

#### Option A: Git Integration (Recommended)

1. Push code to GitHub/GitLab
2. Connect repository in Netlify dashboard
3. Configure environment variables
4. Deploy automatically on push

#### Option B: Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## 🔧 Local Development

```bash
# Clone repository
git clone https://github.com/your-username/instantiate.git
cd instantiate

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

## 🌐 Production Deployment

### Environment Setup

1. **Database**: Use managed PostgreSQL (Neon recommended for serverless)
2. **Azure Setup**: Register multi-tenant app for service provider model
3. **Monitoring**: Configure logging and error tracking
4. **CDN**: Netlify provides global CDN automatically

### Security Considerations

- Store sensitive credentials in Netlify environment variables
- Use HTTPS for all API communications
- Implement rate limiting for API endpoints
- Enable CORS for allowed domains only

### Performance Optimization

- Enable Netlify's asset optimization
- Configure proper caching headers
- Use environment-specific builds
- Monitor bundle size and loading times

## 📊 Monitoring & Analytics

- **Deployment Status**: Real-time deployment tracking
- **Error Logging**: Comprehensive error reporting
- **Usage Analytics**: Track infrastructure provisioning
- **Performance Metrics**: Monitor response times and success rates

## 🔐 Azure Service Provider Setup

For production deployments, configure Azure as service provider:

1. **Multi-tenant App Registration**
2. **Azure Partner Center Registration**
3. **Cross-tenant Resource Management**
4. **Automated Billing Integration**

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all environment variables are set
- Review build logs for specific errors

**Database Connection**
- Ensure DATABASE_URL format is correct
- Verify database is accessible from Netlify
- Check connection string encoding

**Azure Authentication**
- Validate Azure credentials are current
- Confirm App Registration permissions
- Check tenant and subscription IDs

### Support

- **Documentation**: [docs.instantiate.dev](https://docs.instantiate.dev)
- **Issues**: GitHub Issues
- **Community**: Discord Server

## 📄 License

MIT License - see LICENSE file for details

---

**Deploy your infrastructure with confidence using Instantiate - the conversational cloud deployment platform.**
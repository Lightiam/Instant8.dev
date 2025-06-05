# Netlify Deployment Guide for Instantiate

## Quick Deploy to Netlify

### Step 1: Prepare Your Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure all configuration files are committed:
   - `netlify.toml`
   - `netlify/functions/server.js`
   - `.env.example`

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your Git provider and select the Instantiate repository
4. Configure build settings:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### Step 3: Environment Variables

In Netlify dashboard, go to Site settings > Environment variables and add:

```
DATABASE_URL=your_postgresql_connection_string
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_SUBSCRIPTION_ID=your_azure_subscription_id
NODE_ENV=production
```

### Step 4: Database Setup

Before first deployment, set up your PostgreSQL database:

**Option A: Neon (Recommended for Serverless)**
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL`

**Option B: Supabase**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string to `DATABASE_URL`

**Option C: Railway**
1. Create account at [railway.app](https://railway.app)
2. Deploy PostgreSQL service
3. Copy connection string to `DATABASE_URL`

### Step 5: Deploy

1. Click "Deploy site" in Netlify
2. Monitor build logs for any errors
3. Once deployed, your site will be available at: `https://your-site-name.netlify.app`

### Step 6: Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add custom domain: `app.instantiate.dev`
3. Configure DNS settings as instructed by Netlify

## Production Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Azure credentials tested
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Build successful
- [ ] API endpoints responding
- [ ] WebSocket connections working

## Build Commands

For manual deployment:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build locally
npm run build:netlify

# Deploy
netlify deploy --prod --dir=dist
```

## Troubleshooting

**Build Fails**
- Check Node.js version is 20.x
- Verify all dependencies are installed
- Review build logs for specific errors

**API Not Working**
- Confirm environment variables are set
- Check function logs in Netlify dashboard
- Verify database connection

**Azure Authentication Errors**
- Validate Azure credentials
- Ensure service principal has proper permissions
- Check tenant and subscription IDs

## Monitoring

- **Function logs**: Netlify dashboard > Functions
- **Build logs**: Netlify dashboard > Deploys
- **Analytics**: Netlify dashboard > Analytics
- **Performance**: Lighthouse reports in Netlify

Your Instantiate deployment will be live at `https://your-site-name.netlify.app` with full Infrastructure as Code capabilities.
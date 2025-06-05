# Complete Azure Environment Setup for Instantiate

## Your Azure Configuration

Based on your previous authentication attempts, I have your Azure details:

- **AZURE_CLIENT_ID**: `b55f930f-537f-4865-bbc5-43dd4e1609f9`
- **AZURE_TENANT_ID**: `4d2858d9-441d-46f0-b085-60e4ca7a5e75`
- **AZURE_SUBSCRIPTION_ID**: [Your subscription ID needed]

## Required: Azure Client Secret

The authentication errors indicate you need the actual secret VALUE, not the keyId. From your Azure App Registration:

1. Go to Azure Portal > App Registrations > Your App
2. Navigate to "Certificates & secrets"
3. Create a new client secret or copy existing secret VALUE
4. The secret should start with characters like "EDo~" based on your manifest hint

## Netlify Environment Variables Setup

Set these exact variables in your Netlify dashboard (Site Settings > Environment Variables):

```
DATABASE_URL=postgresql://username:password@host:port/database
AZURE_CLIENT_ID=b55f930f-537f-4865-bbc5-43dd4e1609f9
AZURE_CLIENT_SECRET=[your_actual_secret_value]
AZURE_TENANT_ID=4d2858d9-441d-46f0-b085-60e4ca7a5e75
AZURE_SUBSCRIPTION_ID=[your_subscription_id]
NODE_ENV=production
```

## Database Setup Options

**Option 1: Neon PostgreSQL (Recommended)**
- Visit: https://neon.tech
- Create project: "instantiate-db"
- Copy connection string to DATABASE_URL

**Option 2: Supabase PostgreSQL**
- Visit: https://supabase.com
- Create project: "instantiate"
- Copy connection string from Settings > Database

## Production Server Function

Replace your `netlify/functions/server.js` with the production-ready version I created in `netlify-production-server.js`. This includes:

- Real Azure credential validation
- Infrastructure deployment endpoints
- Code generation capabilities
- Professional API responses

## Verification Steps

After configuring environment variables:

1. Deploy updated server function to GitHub
2. Test API health: `https://your-site.netlify.app/.netlify/functions/server`
3. Test Azure connection: POST to `/api/credentials/test/azure`
4. Test deployment: POST to `/api/deploy` with Terraform code

Your platform will then support real Azure infrastructure deployment with professional-grade capabilities.

## Next Actions Required

1. Provide your actual Azure client secret value
2. Provide your Azure subscription ID
3. Set up PostgreSQL database (Neon recommended)
4. Configure all environment variables in Netlify dashboard
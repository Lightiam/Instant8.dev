# Azure Setup Guide for Instanti8.dev

Your Azure App Registration (b55f930f-537f-4865-bbc5-43dd4e1609f9) needs additional permissions to deploy resources.

## Required API Permissions

1. Go to Azure Portal > App Registrations > Your App
2. Click "API permissions"
3. Add these permissions:

### Azure Service Management
- **API**: Azure Service Management
- **Permission**: user_impersonation
- **Type**: Delegated

### Microsoft Graph (if needed)
- **API**: Microsoft Graph  
- **Permission**: User.Read
- **Type**: Delegated

## Required Role Assignments

Your service principal needs these Azure RBAC roles:

1. **Contributor** - At subscription level
2. **Application Administrator** - For App Service deployments

## Steps to Fix:

1. **Add API Permissions:**
   ```
   Azure Portal > App Registrations > Your App > API permissions > Add a permission
   → Azure Service Management → Delegated permissions → user_impersonation
   ```

2. **Grant Admin Consent:**
   ```
   Click "Grant admin consent for [your tenant]"
   ```

3. **Assign RBAC Roles:**
   ```
   Azure Portal > Subscriptions > Your Subscription > Access control (IAM)
   → Add role assignment → Contributor → Select your service principal
   ```

4. **Create New Client Secret:**
   ```
   App Registrations > Your App > Certificates & secrets
   → New client secret → Copy the VALUE (not the Secret ID)
   ```

The client secret value starts with characters like "EDo~" based on your hint in the manifest.
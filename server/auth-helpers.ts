import { DefaultAzureCredential, ManagedIdentityCredential, EnvironmentCredential } from '@azure/identity';

export function createSimpleAzureAuth() {
  // Try multiple authentication methods in order of preference
  
  // Method 1: Environment variables (current approach)
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    return new EnvironmentCredential();
  }
  
  // Method 2: Default Azure credential (handles multiple auth methods automatically)
  return new DefaultAzureCredential();
}

export function validateAzureCredentials() {
  const required = ['AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'AZURE_TENANT_ID', 'AZURE_SUBSCRIPTION_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Azure credentials: ${missing.join(', ')}`);
  }
  
  return true;
}

export function getSimplifiedErrorMessage(error: any): string {
  if (error.message?.includes('AADSTS7000215')) {
    return 'Invalid Azure client secret. Please verify you copied the secret value, not the secret ID.';
  }
  
  if (error.message?.includes('AADSTS70002')) {
    return 'Invalid Azure client credentials. Please check your Client ID and Secret.';
  }
  
  if (error.message?.includes('AADSTS90002')) {
    return 'Invalid Azure tenant ID. Please verify your Tenant ID is correct.';
  }
  
  if (error.message?.includes('insufficient privileges')) {
    return 'Azure account needs Contributor permissions. Contact your Azure administrator.';
  }
  
  return 'Azure authentication failed. Please verify your credentials are correct.';
}
# DRA Dynamics - Dataverse Integration

This project demonstrates integration with Microsoft Dataverse using React, TypeScript, and MSAL for authentication.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Microsoft Azure account with Azure AD and Dataverse setup
- Azure AD application with appropriate permissions for Dataverse

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd DRA_Dynamics
   ```

2. Install dependencies:
   ```bash
   cd dra-web-app
   npm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   # Azure AD Configuration
   VITE_AZURE_AD_TENANT_ID=your_tenant_id
   VITE_AZURE_AD_CLIENT_ID=your_client_id
   VITE_AZURE_AD_CLIENT_SECRET=your_client_secret

   # Dataverse Configuration
   VITE_DATAVERSE_URL=your_dataverse_url
   VITE_DATAVERSE_API_URL=your_dataverse_url/api/data/v9.2
   VITE_DATAVERSE_SCOPE=your_dataverse_url/.default
   ```

4. Update the `.env` file with your actual Azure AD and Dataverse credentials.

## Azure AD Configuration

1. Register a new application in Azure AD:
   - Go to Azure Portal > Azure Active Directory > App registrations
   - Click "New registration"
   - Name your application
   - Select "Single-page application (SPA)" as the application type
   - Set the redirect URI to `http://localhost:3000` (for development)
   - Click "Register"

2. Configure API permissions:
   - Go to your registered application > API permissions
   - Add the following permissions:
     - Dynamics 365 API > Dynamics 365 API user_impersonation
   - Click "Grant admin consent"

3. Create a client secret:
   - Go to your registered application > Certificates & secrets
   - Click "New client secret"
   - Add a description and select an expiration
   - Copy the generated secret value (you won't be able to see it again)

## Dataverse Configuration

1. Ensure your Dataverse environment is properly configured with the necessary entities.
2. The application is configured to work with the following entities:
   - dra_client
   - dra_debtaccount
   - dra_clientnote
   - dra_deal
   - dra_creditpull

## Development

To start the development server:

```bash
cd dra-web-app
npm run dev
```

The application will be available at http://localhost:3000.

## Building for Production

To build the application for production:

```bash
cd dra-web-app
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `dra-web-app/` - React application
  - `src/` - Source code
    - `components/` - React components
    - `config/` - Configuration files
    - `services/` - API services
    - `hooks/` - Custom React hooks
    - `types/` - TypeScript type definitions
    - `utils/` - Utility functions
  - `scripts/` - Utility scripts

## Authentication Flow

The application uses MSAL (Microsoft Authentication Library) for authentication with Azure AD. The authentication flow is as follows:

1. User clicks "Login" button
2. MSAL redirects to Azure AD login page
3. User authenticates with Azure AD
4. Azure AD redirects back to the application with an authorization code
5. MSAL exchanges the code for an access token
6. The access token is used for API calls to Dataverse

## Troubleshooting

- If you encounter CORS issues, ensure your Azure AD application has the correct redirect URIs configured.
- If you encounter authentication issues, check that your Azure AD application has the correct API permissions.
- If you encounter API issues, check that your Dataverse environment has the necessary entities and permissions configured. 
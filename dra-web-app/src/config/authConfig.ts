import { Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID}`,
        redirectUri: window.location.origin,
        navigateToLoginRequestUrl: true,
        postLogoutRedirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error('MSAL:', message);
                        return;
                    case LogLevel.Info:
                        console.info('MSAL:', message);
                        return;
                    case LogLevel.Verbose:
                        console.debug('MSAL:', message);
                        return;
                    case LogLevel.Warning:
                        console.warn('MSAL:', message);
                        return;
                    default:
                        return;
                }
            },
            logLevel: LogLevel.Verbose
        }
    }
};

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the MSAL instance
let msalInitialized = false;

export const initializeMsal = async () => {
    if (!msalInitialized) {
        await msalInstance.initialize();
        msalInitialized = true;
        
        // Handle the redirect flow
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
            // Set the active account after redirect
            msalInstance.setActiveAccount(response.account);
        }
    }
    return msalInstance;
};

export const loginRequest = {
    scopes: [import.meta.env.VITE_DATAVERSE_SCOPE],
    prompt: "select_account"
};

export const protectedResources = {
    dataverseApi: {
        endpoint: import.meta.env.VITE_DATAVERSE_API_URL,
        scopes: [import.meta.env.VITE_DATAVERSE_SCOPE]
    }
}; 
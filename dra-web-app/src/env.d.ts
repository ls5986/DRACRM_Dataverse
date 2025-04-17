/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AZURE_AD_CLIENT_ID: string
    readonly VITE_AZURE_AD_TENANT_ID: string
    readonly VITE_AZURE_AD_CLIENT_SECRET: string
    readonly VITE_DATAVERSE_URL: string
    readonly VITE_DATAVERSE_API_URL: string
    readonly VITE_DATAVERSE_SCOPE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 
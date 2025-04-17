# Debt Resolution Solution Sample Data Script
param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl
)

# Function to check if Power Platform CLI is installed
function Test-PowerPlatformCLI {
    try {
        $pacVersion = pac --version
        Write-Host "Power Platform CLI version: $pacVersion"
        return $true
    }
    catch {
        Write-Error "Power Platform CLI is not installed or not in PATH."
        Write-Host "For macOS, install using one of these methods:"
        Write-Host "Option 1: Using npm (recommended)"
        Write-Host "npm install -g @microsoft/powerplatform-cli-wrapper"
        Write-Host "Option 2: Using .NET tool"
        Write-Host "dotnet tool install --global Microsoft.PowerPlatform.CLI"
        Write-Host "For Windows, install using: winget install Microsoft.PowerPlatformCLI"
        Write-Host "After installation, you may need to restart your terminal or add the installation directory to your PATH."
        Write-Host "For more information, see: https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction#install-power-platform-cli"
        return $false
    }
}

# Function to check if running on macOS
function Test-MacOS {
    return $PSVersionTable.Platform -eq "Unix" -or $PSVersionTable.Platform -eq "Unix-Apple"
}

# Function to create sample clients
function New-SampleClients {
    $clients = @(
        @{
            name = "John Smith"
        },
        @{
            name = "Jane Doe"
        },
        @{
            name = "Robert Johnson"
        }
    )
    
    foreach ($client in $clients) {
        Write-Host "Creating client: $($client.name)"
        try {
            pac solution create-record --entity cr2a0_client --attributes "cr2a0_name=$($client.name)"
        }
        catch {
            Write-Error "Failed to create client $($client.name): $_"
        }
    }
}

# Function to create sample debt accounts
function New-SampleDebtAccounts {
    $debtAccounts = @(
        @{
            creditorName = "Credit Card Co"
            balance = 5000
            clientName = "John Smith"
        },
        @{
            creditorName = "Bank Loan"
            balance = 15000
            clientName = "John Smith"
        },
        @{
            creditorName = "Medical Bills"
            balance = 3000
            clientName = "Jane Doe"
        },
        @{
            creditorName = "Student Loan"
            balance = 25000
            clientName = "Robert Johnson"
        }
    )
    
    foreach ($debtAccount in $debtAccounts) {
        Write-Host "Creating debt account: $($debtAccount.creditorName) for $($debtAccount.clientName)"
        
        try {
            # Get client ID
            $clientId = pac solution query --entity cr2a0_client --filter "cr2a0_name eq '$($debtAccount.clientName)'" --select cr2a0_clientid
            
            if (-not $clientId) {
                Write-Error "Client '$($debtAccount.clientName)' not found. Skipping debt account creation."
                continue
            }
            
            # Create debt account
            pac solution create-record --entity cr2a0_debtaccount --attributes @"
cr2a0_creditorname=$($debtAccount.creditorName)
cr2a0_balance=$($debtAccount.balance)
cr2a0_client=$clientId
"@
        }
        catch {
            Write-Error "Failed to create debt account for $($debtAccount.clientName): $_"
        }
    }
}

# Main execution
try {
    # Check if running on macOS and provide additional guidance
    if (Test-MacOS) {
        Write-Host "Running on macOS. Make sure you're using PowerShell (pwsh) and not bash/zsh."
        Write-Host "If you encounter issues, try running: pwsh -File ./tools/SampleData.ps1 -EnvironmentUrl \"$EnvironmentUrl\""
    }
    
    if (-not (Test-PowerPlatformCLI)) {
        exit 1
    }
    
    Write-Host "Authenticating to environment: $EnvironmentUrl"
    try {
        pac auth create --url $EnvironmentUrl
    }
    catch {
        Write-Error "Failed to authenticate to environment: $_"
        Write-Host "Make sure you have the correct permissions and the environment URL is valid."
        exit 1
    }
    
    Write-Host "Creating sample data..."
    New-SampleClients
    New-SampleDebtAccounts
    
    Write-Host "Sample data created successfully."
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
} 
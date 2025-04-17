# Debt Resolution Solution Deployment Script
param(
    [Parameter(Mandatory=$false)]
    [switch]$Initialize,
    
    [Parameter(Mandatory=$false)]
    [switch]$Build,
    
    [Parameter(Mandatory=$false)]
    [switch]$Deploy,
    
    [Parameter(Mandatory=$false)]
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

# Function to initialize the development environment
function Initialize-Environment {
    if (-not (Test-PowerPlatformCLI)) {
        return
    }
    
    Write-Host "Initializing development environment..."
    
    try {
        # First, ensure we're in the correct directory
        Set-Location $PSScriptRoot/..
        
        # Create a new publisher
        Write-Host "Creating publisher..."
        pac publisher create --name "CR2A0" --display-name "CR2A0" --description "CR2A0 Publisher" --prefix "cr2a0"
        
        # Initialize the solution
        Write-Host "Initializing solution..."
        pac solution init --publisher-name "CR2A0" --publisher-prefix "cr2a0"
        
        # Create the solution structure
        Write-Host "Creating solution structure..."
        New-Item -ItemType Directory -Force -Path "src/Entities" | Out-Null
        New-Item -ItemType Directory -Force -Path "src/Relationships" | Out-Null
        New-Item -ItemType Directory -Force -Path "src/Other" | Out-Null
        
        Write-Host "Development environment initialized successfully."
    }
    catch {
        Write-Error "Failed to initialize solution: $_"
        Write-Host "If you're on macOS, make sure you're running this script with PowerShell (pwsh) and not bash/zsh."
        exit 1
    }
}

# Function to build the solution
function Build-Solution {
    if (-not (Test-PowerPlatformCLI)) {
        return
    }
    
    Write-Host "Building solution..."
    
    try {
        # Ensure solutions directory exists
        New-Item -ItemType Directory -Force -Path "solutions" | Out-Null
        
        # Pack the solution
        pac solution pack --zipfile "solutions/DebtResolutionSolution.zip" --folder "src"
        
        Write-Host "Solution built successfully."
    }
    catch {
        Write-Error "Failed to build solution: $_"
        exit 1
    }
}

# Function to deploy the solution
function Deploy-Solution {
    if (-not (Test-PowerPlatformCLI)) {
        return
    }
    
    if (-not $EnvironmentUrl) {
        Write-Error "Environment URL is required for deployment. Please provide it using -EnvironmentUrl parameter."
        return
    }
    
    Write-Host "Deploying solution to $EnvironmentUrl..."
    
    # Authenticate to the environment
    try {
        pac auth create --url $EnvironmentUrl
    }
    catch {
        Write-Error "Failed to authenticate to environment: $_"
        Write-Host "Make sure you have the correct permissions and the environment URL is valid."
        exit 1
    }
    
    # Import the solution
    try {
        pac solution import --path "solutions/DebtResolutionSolution.zip"
        Write-Host "Solution deployed successfully."
    }
    catch {
        Write-Error "Failed to import solution: $_"
        exit 1
    }
}

# Function to create entity definitions
function Create-EntityDefinitions {
    Write-Host "Creating entity definitions..."
    
    # Create directories for entities
    $entitiesDir = "DebtResolutionSolution/src/Entities"
    if (-not (Test-Path $entitiesDir)) {
        New-Item -ItemType Directory -Path $entitiesDir | Out-Null
    }
    
    # Create Client entity
    $clientDir = "$entitiesDir/cr2a0_client"
    if (-not (Test-Path $clientDir)) {
        New-Item -ItemType Directory -Path $clientDir | Out-Null
    }
    
    # Create Client entity definition
    $clientEntityXml = @'
<?xml version="1.0" encoding="utf-8"?>
<Entity xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Name LocalizedName="Client" OriginalName="Client">cr2a0_client</Name>
  <EntityInfo>
    <entity Name="cr2a0_client">
      <attributes>
        <attribute PhysicalName="cr2a0_clientid">
          <Type>primarykey</Type>
          <Name>cr2a0_clientid</Name>
          <LogicalName>cr2a0_clientid</LogicalName>
          <RequiredLevel>systemrequired</RequiredLevel>
          <DisplayName>Client</DisplayName>
          <IsCustomField>true</IsCustomField>
        </attribute>
        <attribute PhysicalName="cr2a0_name">
          <Type>nvarchar</Type>
          <Name>cr2a0_name</Name>
          <LogicalName>cr2a0_name</LogicalName>
          <RequiredLevel>required</RequiredLevel>
          <DisplayName>Name</DisplayName>
          <MaxLength>100</MaxLength>
          <IsCustomField>true</IsCustomField>
        </attribute>
      </attributes>
    </entity>
  </EntityInfo>
</Entity>
'@
    Set-Content -Path "$clientDir/Entity.xml" -Value $clientEntityXml -NoNewline
    
    # Create Debt Account entity
    $debtAccountDir = "$entitiesDir/cr2a0_debtaccount"
    if (-not (Test-Path $debtAccountDir)) {
        New-Item -ItemType Directory -Path $debtAccountDir | Out-Null
    }
    
    # Create Debt Account entity definition
    $debtAccountEntityXml = @'
<?xml version="1.0" encoding="utf-8"?>
<Entity xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Name LocalizedName="Debt Account" OriginalName="Debt Account">cr2a0_debtaccount</Name>
  <EntityInfo>
    <entity Name="cr2a0_debtaccount">
      <attributes>
        <attribute PhysicalName="cr2a0_debtaccountid">
          <Type>primarykey</Type>
          <Name>cr2a0_debtaccountid</Name>
          <LogicalName>cr2a0_debtaccountid</LogicalName>
          <RequiredLevel>systemrequired</RequiredLevel>
          <DisplayName>Debt Account</DisplayName>
          <IsCustomField>true</IsCustomField>
        </attribute>
        <attribute PhysicalName="cr2a0_accountnumber">
          <Type>nvarchar</Type>
          <Name>cr2a0_accountnumber</Name>
          <LogicalName>cr2a0_accountnumber</LogicalName>
          <RequiredLevel>required</RequiredLevel>
          <DisplayName>Account Number</DisplayName>
          <MaxLength>50</MaxLength>
          <IsCustomField>true</IsCustomField>
        </attribute>
        <attribute PhysicalName="cr2a0_balance">
          <Type>money</Type>
          <Name>cr2a0_balance</Name>
          <LogicalName>cr2a0_balance</LogicalName>
          <RequiredLevel>required</RequiredLevel>
          <DisplayName>Balance</DisplayName>
          <IsCustomField>true</IsCustomField>
        </attribute>
      </attributes>
    </entity>
  </EntityInfo>
</Entity>
'@
    Set-Content -Path "$debtAccountDir/Entity.xml" -Value $debtAccountEntityXml -NoNewline
    
    Write-Host "Entity definitions created successfully."
}

# Function to create relationship definitions
function Create-RelationshipDefinitions {
    Write-Host "Creating relationship definitions..."
    
    # Create directory for relationships
    $relationshipsDir = "DebtResolutionSolution/src/Relationships"
    if (-not (Test-Path $relationshipsDir)) {
        New-Item -ItemType Directory -Path $relationshipsDir | Out-Null
    }
    
    # Create relationship definition
    $relationshipXml = @'
<?xml version="1.0" encoding="utf-8"?>
<EntityRelationship xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <EntityRelationshipType>OneToMany</EntityRelationshipType>
  <IsCustomizable>1</IsCustomizable>
  <IntroducedVersion>1.0.0.0</IntroducedVersion>
  <IsHierarchical>0</IsHierarchical>
  <ReferencingEntityName>cr2a0_debtaccount</ReferencingEntityName>
  <ReferencedEntityName>cr2a0_client</ReferencedEntityName>
  <CascadeAssign>Cascade</CascadeAssign>
  <CascadeDelete>Cascade</CascadeDelete>
  <CascadeReparent>Cascade</CascadeReparent>
  <CascadeShare>Cascade</CascadeShare>
  <CascadeUnshare>Cascade</CascadeUnshare>
  <ReferencingAttributeName>cr2a0_clientid</ReferencingAttributeName>
  <RelationshipDescription>
    <Descriptions>
      <Description description="Client associated with this debt account" languagecode="1033" />
    </Descriptions>
  </RelationshipDescription>
</EntityRelationship>
'@
    Set-Content -Path "$relationshipsDir/cr2a0_client_debtaccount.xml" -Value $relationshipXml -NoNewline
    
    Write-Host "Relationship definitions created successfully."
}

# Function to create customization file
function Create-CustomizationFile {
    Write-Host "Creating customization file..."
    
    # Create Other directory if it doesn't exist
    $otherDir = "DebtResolutionSolution/src/Other"
    if (-not (Test-Path $otherDir)) {
        New-Item -ItemType Directory -Path $otherDir | Out-Null
    }
    
    # Create Solution.xml
    $solutionXml = @'
<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml version="9.2.23084.224" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="CrmLive" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SolutionManifest>
    <UniqueName>DebtResolutionSolution</UniqueName>
    <LocalizedNames>
      <LocalizedName description="Debt Resolution Solution" languagecode="1033" />
    </LocalizedNames>
    <Descriptions>
      <Description description="A comprehensive solution for managing debt resolution services" languagecode="1033" />
    </Descriptions>
    <Version>1.0.0.0</Version>
    <Managed>0</Managed>
    <Publisher>
      <UniqueName>CR2A0</UniqueName>
      <LocalizedNames>
        <LocalizedName description="CR2A0" languagecode="1033" />
      </LocalizedNames>
      <Descriptions>
        <Description description="CR2A0 Publisher" languagecode="1033" />
      </Descriptions>
      <EMailAddress></EMailAddress>
      <SupportingWebsiteUrl></SupportingWebsiteUrl>
      <CustomizationPrefix>cr2a0</CustomizationPrefix>
      <CustomizationOptionValuePrefix>10000</CustomizationOptionValuePrefix>
      <Addresses>
        <Address>
          <AddressNumber>1</AddressNumber>
          <AddressTypeCode>1</AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode>1</ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
        <Address>
          <AddressNumber>2</AddressNumber>
          <AddressTypeCode>1</AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode>1</ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
      </Addresses>
    </Publisher>
    <RootComponents>
      <RootComponent type="1" schemaName="cr2a0_client" behavior="0" />
      <RootComponent type="1" schemaName="cr2a0_debtaccount" behavior="0" />
    </RootComponents>
    <MissingDependencies />
  </SolutionManifest>
</ImportExportXml>
'@
    Set-Content -Path "$otherDir/Solution.xml" -Value $solutionXml -NoNewline
    
    # Create Customizations.xml
    $customizationsXml = @'
<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Entities />
  <Roles />
  <Workflows />
  <FieldSecurityProfiles />
  <Templates />
  <EntityMaps />
  <EntityRelationships />
  <OrganizationSettings />
  <optionsets />
  <CustomControls />
  <EntityDataProviders />
  <Languages>
    <Language>1033</Language>
  </Languages>
</ImportExportXml>
'@
    Set-Content -Path "$otherDir/Customizations.xml" -Value $customizationsXml -NoNewline
    
    Write-Host "Customization file created successfully."
}

# Main execution
try {
    # Check if running on macOS and provide additional guidance
    if (Test-MacOS) {
        Write-Host "Running on macOS. Make sure you're using PowerShell (pwsh) and not bash/zsh."
        Write-Host "If you encounter issues, try running: pwsh -File ./tools/Deploy.ps1 [parameters]"
    }
    
    if ($Initialize) {
        Initialize-Environment
        Create-EntityDefinitions
        Create-RelationshipDefinitions
        Create-CustomizationFile
    }
    
    if ($Build) {
        Build-Solution
    }
    
    if ($Deploy) {
        Deploy-Solution
    }
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
} 
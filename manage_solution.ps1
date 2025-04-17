#!/usr/bin/env pwsh

# Error handling
$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$message)
    Write-Host "`n=== $message ===" -ForegroundColor Cyan
}

function Handle-Error {
    param([string]$step)
    Write-Host "Error during $step. Exiting..." -ForegroundColor Red
    exit 1
}

# Step 1: Connect to environment
Write-Step "Connecting to environment"
try {
    pac auth create --url https://trasandbox.crm.dynamics.com
} catch {
    Handle-Error "authentication"
}

# Step 2: Export existing solution
Write-Step "Exporting DRA solution"
try {
    if (Test-Path "./DRA.zip") {
        Remove-Item "./DRA.zip"
    }
    pac solution export --name DRA --path ./DRA.zip --managed false
} catch {
    Handle-Error "solution export"
}

# Step 3: Unpack solution
Write-Step "Unpacking solution"
try {
    if (Test-Path "./extracted-DRA") {
        Remove-Item "./extracted-DRA" -Recurse -Force
    }
    pac solution unpack --zipfile ./DRA.zip --folder ./extracted-DRA
} catch {
    Handle-Error "solution unpack"
}

# Step 4: Examine entity definitions
Write-Step "Examining entity definitions"
try {
    Write-Host "Available entities:"
    Get-ChildItem "./extracted-DRA/Entities" -Directory | ForEach-Object {
        Write-Host "- $($_.Name)"
    }
} catch {
    Handle-Error "entity examination"
}

# Step 5: Update entity definitions
Write-Step "Updating entity definitions"

# Function to add field to entity XML
function Add-Field {
    param(
        [string]$entityPath,
        [string]$fieldName,
        [string]$displayName,
        [string]$type,
        [int]$maxLength = 0,
        [int]$precision = 0,
        [string]$format = "text"
    )

    try {
        $xmlPath = Join-Path $entityPath "Entity.xml"
        [xml]$xml = Get-Content $xmlPath

        # Create new attribute element
        $newAttribute = $xml.CreateElement("attribute")
        $newAttribute.SetAttribute("PhysicalName", $fieldName)

        # Add basic elements
        $elements = @{
            "Type" = $type
            "Name" = $fieldName
            "LogicalName" = $fieldName
            "RequiredLevel" = "None"
            "DisplayMask" = "ValidForAdvancedFind|ValidForForm|ValidForGrid"
            "IsCustomField" = "1"
            "IsAuditEnabled" = "1"
        }

        if ($maxLength -gt 0) {
            $elements["MaxLength"] = $maxLength.ToString()
        }

        if ($precision -gt 0) {
            $elements["Precision"] = $precision.ToString()
            $elements["Scale"] = "2"
        }

        $elements["Format"] = $format

        foreach ($key in $elements.Keys) {
            $elem = $xml.CreateElement($key)
            $elem.InnerText = $elements[$key]
            $newAttribute.AppendChild($elem)
        }

        # Add LocalizedNames
        $localizedNames = $xml.CreateElement("LocalizedNames")
        $localizedName = $xml.CreateElement("LocalizedName")
        $localizedName.SetAttribute("description", $displayName)
        $localizedName.SetAttribute("languagecode", "1033")
        $localizedNames.AppendChild($localizedName)
        $newAttribute.AppendChild($localizedNames)

        # Add Descriptions
        $descriptions = $xml.CreateElement("Descriptions")
        $description = $xml.CreateElement("Description")
        $description.SetAttribute("description", $displayName)
        $description.SetAttribute("languagecode", "1033")
        $descriptions.AppendChild($description)
        $newAttribute.AppendChild($descriptions)

        # Add to attributes section
        $attributesNode = $xml.SelectSingleNode("//attributes")
        $attributesNode.AppendChild($newAttribute)

        # Save the file
        $xml.Save($xmlPath)
        Write-Host "Added field $fieldName to entity"
    } catch {
        Write-Host $_.Exception.Message
        Handle-Error "adding field $fieldName"
    }
}

# Add fields to Client entity
$clientPath = "./extracted-DRA/Entities/dra_Client"
Add-Field -entityPath $clientPath -fieldName "dra_phone" -displayName "Phone" -type "nvarchar" -maxLength 20 -format "phone"
Add-Field -entityPath $clientPath -fieldName "dra_email" -displayName "Email" -type "nvarchar" -maxLength 100 -format "email"

# Add fields to Debt Account entity
$debtAccountPath = "./extracted-DRA/Entities/dra_DebtAccount"
Add-Field -entityPath $debtAccountPath -fieldName "dra_accountnumber" -displayName "Account Number" -type "nvarchar" -maxLength 30
Add-Field -entityPath $debtAccountPath -fieldName "dra_interestrate" -displayName "Interest Rate" -type "decimal" -precision 2 -format "decimal"

# Step 7: Repack solution
Write-Step "Repacking solution"
try {
    if (Test-Path "./updated-DRA.zip") {
        Remove-Item "./updated-DRA.zip"
    }
    pac solution pack --zipfile ./updated-DRA.zip --folder ./extracted-DRA
} catch {
    Handle-Error "solution pack"
}

# Step 8: Import updated solution
Write-Step "Importing updated solution"
try {
    pac solution import --path ./updated-DRA.zip --force-overwrite --publish-changes
} catch {
    Handle-Error "solution import"
}

Write-Step "Process completed successfully!" 
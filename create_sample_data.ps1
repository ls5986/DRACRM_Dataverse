# Install required modules if not already installed
if (-not (Get-Module -ListAvailable -Name Microsoft.Xrm.Data.PowerShell)) {
    Install-Module -Name Microsoft.Xrm.Data.PowerShell -Force -AllowClobber
}

# Import the module
Import-Module Microsoft.Xrm.Data.PowerShell

# Set environment variables
$env:DATAVERSE_URL = "https://trasandbox.crm.dynamics.com"
$env:DATAVERSE_CLIENT_ID = "b65d8e0b-8c61-40bb-8bc0-33ed4023f2dc"
$env:DATAVERSE_CLIENT_SECRET = "cO18Q~Jfsa8X~MEG5Xnln0VOUovHC_lDujDsVcTZ"
$env:DATAVERSE_TENANT_ID = "185fc38c-2c1b-4307-a164-24a4072e83e1"

# Connect to your Dataverse environment
$ConnectionString = "AuthType=ClientSecret;Url=$env:DATAVERSE_URL;ClientId=$env:DATAVERSE_CLIENT_ID;ClientSecret=$env:DATAVERSE_CLIENT_SECRET;TenantId=$env:DATAVERSE_TENANT_ID"
Connect-CrmOnline -ConnectionString $ConnectionString

# Create clients
Write-Host "Creating clients..."
$client1 = @{
    "dra_firstname" = "John"
    "dra_lastname" = "Doe"
    "dra_email" = "john.doe@example.com"
    "dra_phone" = "555-0101"
    "dra_address" = "123 Main St"
    "dra_city" = "Anytown"
    "dra_state" = "CA"
    "dra_zip" = "90210"
    "dra_status" = "Active"
}
$client1Id = New-CrmRecord -EntityLogicalName "dra_client" -Fields $client1

$client2 = @{
    "dra_firstname" = "Jane"
    "dra_lastname" = "Smith"
    "dra_email" = "jane.smith@example.com"
    "dra_phone" = "555-0102"
    "dra_address" = "456 Oak Ave"
    "dra_city" = "Somewhere"
    "dra_state" = "NY"
    "dra_zip" = "10001"
    "dra_status" = "Active"
}
$client2Id = New-CrmRecord -EntityLogicalName "dra_client" -Fields $client2

# Create debt accounts
Write-Host "Creating debt accounts..."
$debtAccount1 = @{
    "dra_accountnumber" = "ACC001"
    "dra_originalbalance" = 15000.00
    "dra_balance" = 12000.00
    "dra_creditor" = "Credit Card Co"
    "dra_accounttype" = "Credit Card"
    "dra_status" = "Active"
    "dra_interestrate" = 18.99
}
$debtAccount1Id = New-CrmRecord -EntityLogicalName "dra_debtaccount" -Fields $debtAccount1

$debtAccount2 = @{
    "dra_accountnumber" = "ACC002"
    "dra_originalbalance" = 25000.00
    "dra_balance" = 22000.00
    "dra_creditor" = "Bank of Loans"
    "dra_accounttype" = "Personal Loan"
    "dra_status" = "Active"
    "dra_interestrate" = 12.5
}
$debtAccount2Id = New-CrmRecord -EntityLogicalName "dra_debtaccount" -Fields $debtAccount2

# Create client notes
Write-Host "Creating client notes..."
$note1 = @{
    "dra_subject" = "Initial Contact"
    "dra_note" = "Client interested in debt settlement program"
    "dra_type" = "Communication"
    "dra_client" = @{ "LogicalName" = "dra_client"; "Id" = $client1Id }
}
New-CrmRecord -EntityLogicalName "dra_clientnote" -Fields $note1

$note2 = @{
    "dra_subject" = "Credit Report Review"
    "dra_note" = "Credit score: 650, multiple late payments"
    "dra_type" = "Credit Review"
    "dra_client" = @{ "LogicalName" = "dra_client"; "Id" = $client2Id }
}
New-CrmRecord -EntityLogicalName "dra_clientnote" -Fields $note2

# Create deals
Write-Host "Creating deals..."
$deal1 = @{
    "dra_offeramount" = 7200.00
    "dra_status" = "Accepted"
    "dra_terms" = "12 months"
    "dra_type" = "Settlement"
    "dra_debtaccount" = @{ "LogicalName" = "dra_debtaccount"; "Id" = $debtAccount1Id }
}
New-CrmRecord -EntityLogicalName "dra_deal" -Fields $deal1

$deal2 = @{
    "dra_offeramount" = 13200.00
    "dra_status" = "Pending"
    "dra_terms" = "24 months"
    "dra_type" = "Settlement"
    "dra_debtaccount" = @{ "LogicalName" = "dra_debtaccount"; "Id" = $debtAccount2Id }
}
New-CrmRecord -EntityLogicalName "dra_deal" -Fields $deal2

# Create credit pulls
Write-Host "Creating credit pulls..."
$creditPull1 = @{
    "dra_score" = 650
    "dra_reportdate" = Get-Date
    "dra_provider" = "Experian"
    "dra_client" = @{ "LogicalName" = "dra_client"; "Id" = $client1Id }
}
New-CrmRecord -EntityLogicalName "dra_creditpull" -Fields $creditPull1

$creditPull2 = @{
    "dra_score" = 645
    "dra_reportdate" = Get-Date
    "dra_provider" = "TransUnion"
    "dra_client" = @{ "LogicalName" = "dra_client"; "Id" = $client2Id }
}
New-CrmRecord -EntityLogicalName "dra_creditpull" -Fields $creditPull2

Write-Host "Sample data creation completed!" 
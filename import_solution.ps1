# Script to pack and import the DRA solution
$solutionPath = "DRA.zip"
$solutionFolder = "temp_solution"

# Pack the solution
Write-Host "Packing solution..."
pac solution pack --folder $solutionFolder --zipfile $solutionPath --packagetype Unmanaged

# Import the solution
Write-Host "Importing solution..."
pac solution import --path $solutionPath --activate-plugins

# Create sample data
Write-Host "Creating sample data..."
./create_sample_data.ps1

Write-Host "Solution import and sample data creation completed!" 
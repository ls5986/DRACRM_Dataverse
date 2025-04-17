# Cleanup script for Power Platform solution
Write-Host "Cleaning up existing project structure..."

# Directories to remove
$directoriesToRemove = @(
    "src",
    "test-solution",
    "bin",
    "obj",
    "Relationships",
    "Other",
    "Entities",
    "solutions"
)

# Files to remove
$filesToRemove = @(
    "DRA_Dynamics.cdsproj",
    ".gitignore"
)

# Remove directories
foreach ($dir in $directoriesToRemove) {
    if (Test-Path $dir) {
        Write-Host "Removing directory: $dir"
        Remove-Item -Path $dir -Recurse -Force
    }
}

# Remove files
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing file: $file"
        Remove-Item -Path $file -Force
    }
}

Write-Host "Cleanup completed successfully." 
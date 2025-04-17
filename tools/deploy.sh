#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create solution package
create_package() {
    echo "Creating solution package..."
    mkdir -p solutions
    cd src && zip -r ../solutions/DebtResolutionSolution.zip * && cd ..
    if [ $? -eq 0 ]; then
        echo "Solution package created successfully"
    else
        echo "Failed to create solution package"
        exit 1
    fi
}

# Main script
echo "Starting deployment process..."

# Create the package
create_package

# Check if pac CLI is installed
if ! command_exists pac; then
    echo "Power Platform CLI not found. Installing..."
    curl -L -o pac.zip https://aka.ms/PowerAppsCLI
    sudo unzip -d /usr/local/pac pac.zip
    echo 'export PATH=$PATH:/usr/local/pac' >> ~/.zshrc
    source ~/.zshrc
fi

# Authenticate and deploy
echo "Authenticating to environment..."
pac auth create --url https://trasandbox.crm.dynamics.com

echo "Deploying solution..."
pac solution import --path solutions/DebtResolutionSolution.zip

echo "Deployment complete!" 
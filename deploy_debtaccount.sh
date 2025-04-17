#!/bin/bash

echo "Cleaning up previous solution package..."
rm -f solutions/DebtResolutionSolution.zip

echo "Creating solutions directory if it doesn't exist..."
mkdir -p solutions

echo "Creating temporary directory for solution..."
rm -rf temp_src
mkdir -p temp_src/Entities
mkdir -p temp_src/Other

# Copy only the Debt Account entity definition
cp -r src/Entities/cr2a0_debtaccount temp_src/Entities/

# Copy the solution files
cp src/Other/Customizations.xml temp_src/Other/
cp src/Other/Solution.xml temp_src/Other/

# Modify Solution.xml to only include the Debt Account entity
sed -i '' '/cr2a0_client/d' temp_src/Other/Solution.xml

echo "Packing solution..."
if pac solution pack --folder temp_src --zipfile solutions/DebtResolutionSolution.zip --packagetype Unmanaged; then
    echo "Solution packed successfully"
else
    echo "Failed to pack solution"
    exit 1
fi

echo "Importing solution..."
if pac solution import --path solutions/DebtResolutionSolution.zip --environment "https://trasandbox.crm.dynamics.com" --force-overwrite --publish-changes; then
    echo "Solution imported successfully"
else
    echo "Failed to import solution"
    exit 1
fi

echo "Cleaning up..."
rm -rf temp_src

echo "Solution deployment complete!" 
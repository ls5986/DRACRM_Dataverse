#!/bin/bash

echo "Packing solution from src directory..."

# Create solutions directory if it doesn't exist
mkdir -p solutions

# Pack the solution
if pac solution pack --folder src --zipfile solutions/DebtAccountSolution.zip --packagetype Unmanaged; then
    echo "Solution packed successfully to solutions/DebtAccountSolution.zip"
else
    echo "Failed to pack solution"
    exit 1
fi 
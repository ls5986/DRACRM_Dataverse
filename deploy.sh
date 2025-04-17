#!/bin/zsh

# Create necessary directories
mkdir -p solutions
mkdir -p src/Other

# Pack the solution
pac solution pack --zipfile solutions/DebtResolutionSolution.zip --folder src

# Import the solution
pac solution import --path solutions/DebtResolutionSolution.zip 
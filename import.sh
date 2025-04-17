#!/bin/bash

# Check if environment URL is provided
if [ -z "$1" ]; then
    echo "Error: Environment URL not provided"
    echo "Usage: ./import.sh <environment_url>"
    exit 1
fi

ENVIRONMENT_URL="$1"
SOLUTION_FILE="solutions/DebtAccountSolution.zip"

# Check if solution file exists
if [ ! -f "$SOLUTION_FILE" ]; then
    echo "Error: Solution file not found at $SOLUTION_FILE"
    exit 1
fi

echo "Importing solution to environment: $ENVIRONMENT_URL"

# Attempt to import the solution with force-overwrite and async
if pac solution import --path "$SOLUTION_FILE" --environment "$ENVIRONMENT_URL" --force-overwrite --publish-changes --async; then
    echo "Solution import started..."
    echo "Waiting for import to complete..."
    
    # Wait for a moment to let the import process start
    sleep 10
    
    # Check import status
    if pac solution check-status --environment "$ENVIRONMENT_URL"; then
        echo "Solution imported successfully!"
    else
        echo "Failed to verify solution import status"
        exit 1
    fi
else
    echo "Failed to start solution import"
    exit 1
fi 
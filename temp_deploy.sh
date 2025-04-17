#!/bin/zsh
set -e

echo "Packing solution..."
/Users/lindseystevens/.dotnet/tools/pac solution pack --zipfile solutions/DebtResolutionSolution.zip --folder src

echo "Importing solution..."
/Users/lindseystevens/.dotnet/tools/pac solution import --path solutions/DebtResolutionSolution.zip 
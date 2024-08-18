#!/bin/zsh

# Exit immediately if any command exits with a non-zero status
set -e

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <directory_path>"
  exit 1
fi

# Assign the directory path to a variable
dir_path="$1"

# Check if the specified directory exists
if [ ! -d "$dir_path" ]; then
  echo "Error: Directory '$dir_path' does not exist."
  exit 1
fi

# Iterate over all files in the directory
find "$dir_path" -type f | while read -r file_path; do
  # Compute the relative path by removing the directory prefix
  relative_path="${file_path#$dir_path}"

  # Call the uploadfile command with full and relative paths
  ./uploadfile.sh "$file_path" "$relative_path"
done

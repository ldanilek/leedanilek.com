#!/bin/zsh

# Exit immediately if any command exits with a non-zero status
set -e

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <file_path> <route_path>"
  exit 1
fi

# Assign arguments to variables
file_path="$1"
route_path="$2"

# Check if the file exists
if [ ! -f "$file_path" ]; then
  echo "Error: File '$file_path' does not exist."
  exit 1
fi

# Determine the MIME type of the file
mime_type=$(file --mime-type -b "$file_path")

# Check if mime_type was successfully determined
if [ -z "$mime_type" ]; then
  echo "Error: Could not determine MIME type for '$file_path'."
  exit 1
fi

# Fallback MIME types for common file extensions
case "${file_path##*.}" in
  js) mime_type="application/javascript" ;;
  html) mime_type="text/html" ;;
  css) mime_type="text/css" ;;
  json) mime_type="application/json" ;;
  jpg|jpeg) mime_type="image/jpeg" ;;
  png) mime_type="image/png" ;;
  gif) mime_type="image/gif" ;;
  pdf) mime_type="application/pdf" ;;
  *)
    # Use the MIME type determined by file command if not in fallback list
    if [ -z "$mime_type" ]; then
      echo "Error: Could not determine MIME type for '$file_path'."
      exit 1
    fi
    ;;
esac

echo "Uploading file '$file_path' to route '$route_path' as '$mime_type'..."

# Get a url to upload the file to
uploadUrl=$(npx convex run 'routes:uploadUrl' | jq -r ".")

# Perform the curl request to upload the file
storageId=$(curl -s -X POST "$uploadUrl" \
  -H "Content-Type: $mime_type" \
  --data-binary @"$file_path" | jq -r ".storageId")

json_payload=$(jq -n --arg path "$route_path" --arg storageId "$storageId" \
  '{path: $path, storageId: $storageId}')

npx convex run 'routes:upload' "$json_payload"

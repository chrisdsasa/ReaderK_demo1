#!/bin/bash

# Clean dist directory
rm -rf dist

# Install dependencies
npm install

# Run type checking
npm run type-check

# Build the extension
npm run build

# Create zip file for distribution
cd dist
zip -r ../smart-reading-assistant.zip ./*
cd ..

echo "Build completed successfully!" 
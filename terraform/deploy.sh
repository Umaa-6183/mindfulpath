# terraform/deploy.sh

#!/bin/bash

set -e

echo "🚀 Deploying MindfulPath Infrastructure..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform."
    exit 1
fi

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init

# Validate configuration
echo "✅ Validating Terraform configuration..."
terraform validate

# Plan deployment
echo "📋 Planning infrastructure..."
terraform plan -out=tfplan

# Apply deployment
echo "🔨 Applying infrastructure changes..."
terraform apply tfplan

echo "✨ Infrastructure deployment complete!"
echo "Run 'terraform output' to see the outputs."

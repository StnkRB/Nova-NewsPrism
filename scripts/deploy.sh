#!/bin/bash

# Configuration
APP_NAME="newsprism"
REGION="us-east-1" # Update to your preferred region

echo "🚀 Starting deployment for $APP_NAME to AWS..."

# 1. Build the Docker image
echo "📦 Building Docker image..."
docker build -t $APP_NAME .

# 2. Authenticate with ECR (Assuming ECR repo exists)
# AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# REPO_URL="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$APP_NAME"
# aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REPO_URL

# 3. Push to ECR
# docker tag $APP_NAME:latest $REPO_URL:latest
# docker push $REPO_URL:latest

echo "🚢 Deploying to AWS App Runner..."
# aws apprunner create-service --service-name $APP_NAME --source-configuration ...

echo "✅ Deployment scripts prepared. Please configure your ECR and App Runner settings."

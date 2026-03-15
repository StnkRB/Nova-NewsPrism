# Deployment Automation (AWS)

This directory contains scripts and configurations for automating the deployment of NewsPrism to AWS.

## Files

- `deploy.sh`: A shell script that builds the Docker image and provides a template for pushing to ECR and deploying to App Runner.
- `Dockerfile`: The container definition for the application.

## Usage

### 1. Prerequisites
- AWS CLI installed and configured.
- Docker installed.
- Amazon Bedrock access with Amazon Nova models enabled.

### 2. Deployment
To prepare the application for deployment:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. AWS App Runner
We recommend using **AWS App Runner** for its simplicity and automatic scaling. You can connect your repository directly to App Runner or push a container image to **Amazon ECR**.

# scripts/deploy.sh

#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
VERSION=$(git describe --tags --always)

echo "🚀 Deploying MindfulPath v$VERSION to $ENVIRONMENT"

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t mindfulpath:$VERSION .
docker tag mindfulpath:$VERSION mindfulpath:latest

# Push to ECR
echo "📤 Pushing to ECR..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
docker tag mindfulpath:$VERSION $ECR_REGISTRY/mindfulpath:$VERSION
docker tag mindfulpath:$VERSION $ECR_REGISTRY/mindfulpath:latest

docker push $ECR_REGISTRY/mindfulpath:$VERSION
docker push $ECR_REGISTRY/mindfulpath:latest

# Deploy frontend to S3
echo "📦 Deploying frontend..."
cd mindfulpath-frontend
npm install
npm run build
S3_BUCKET=$(terraform -chdir=../terraform output -raw s3_bucket_name 2>/dev/null || echo "mindfulpath-assets-$AWS_ACCOUNT_ID")
aws s3 sync build s3://$S3_BUCKET/ --delete

# Invalidate CloudFront
echo "🔄 Invalidating CloudFront cache..."
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='mindfulpath'].Id" --output text)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

# Update ECS service
echo "🚀 Updating ECS service..."
aws ecs update-service --cluster mindfulpath-cluster \
  --service mindfulpath-service \
  --force-new-deployment

echo "✅ Deployment initiated. Check AWS console for progress."
echo "🔗 Application: https://$(terraform -chdir=../terraform output -raw app_domain 2>/dev/null || echo 'mindfulpath.com')"

# Build zip bundle for AWS BeanStalk Deployment

REGION="us-east-1"
DATE=`date +%Y-%m-%d`

HASH=`git rev-parse --short HEAD`

VERSION=momoweb_app-$HASH.zip

BUCKET_NAME="momo-web-deployments"
APPLICATION_ENVIRONMENT="MomoWeb-node"
APPLICATION_NAME="momo-web"

rm momoweb_app-*.zip # Remove old builds

npm run build

aws s3 sync ./build s3://momoweb.com

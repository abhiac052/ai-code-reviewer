#!/bin/bash

echo "🚀 Setting up AI Code Review Assistant (AWS Bedrock Version)..."
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current version: $(node -v)"
  exit 1
fi

echo "✓ Node.js version OK"

# Navigate to ai-code-reviewer directory
cd ai-code-reviewer

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check AWS credentials
echo ""
echo "🔐 Checking AWS credentials..."
if [ -f ~/.aws/credentials ] || [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "✓ AWS credentials found"
else
  echo "⚠️  AWS credentials not found"
  echo "   Run: aws configure"
  echo "   Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo ""
  echo "📝 Creating .env file..."
  cp .env.example .env
fi

# Make CLI executable
chmod +x src/cli.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Quick Start:"
echo "  1. Ensure AWS credentials are configured (aws configure)"
echo "  2. Run: cd ai-code-reviewer && npm run demo"
echo "  3. Or test: node test-voice-assistant.js"
echo ""
echo "💡 No API key needed - uses your AWS credentials!"
echo "📖 Full documentation: ai-code-reviewer/README_AWS.md"
echo ""

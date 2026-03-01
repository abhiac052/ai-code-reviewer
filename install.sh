#!/bin/bash

# AI Code Reviewer - Portable Installation Script
# Use this to install the tool in any project

echo "🚀 Installing AI Code Reviewer..."
echo ""

# Get target directory
TARGET_DIR=${1:-.}

if [ "$TARGET_DIR" != "." ]; then
  echo "📁 Target directory: $TARGET_DIR"
  cd "$TARGET_DIR" || exit 1
fi

# Check if ai-code-reviewer already exists
if [ -d "ai-code-reviewer" ]; then
  echo "⚠️  ai-code-reviewer directory already exists"
  read -p "Do you want to overwrite it? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled"
    exit 1
  fi
  rm -rf ai-code-reviewer
fi

# Copy the tool
echo "📦 Copying AI Code Reviewer..."
cp -r "$(dirname "$0")" ai-code-reviewer

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd ai-code-reviewer
npm install

# Create .env if doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file"
fi

# Check AWS credentials
echo ""
echo "🔐 Checking AWS credentials..."
if [ -f ~/.aws/credentials ] || [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "✅ AWS credentials found"
else
  echo "⚠️  AWS credentials not found"
  echo "   Run: aws configure"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 Quick Start:"
echo "  cd ai-code-reviewer"
echo "  npm run review -- review --flows    # Analyze all flows"
echo "  npm run review -- review -a         # Review entire codebase"
echo "  npm run dashboard                   # Open web dashboard"
echo ""
echo "💡 The tool will scan the parent 'src/' directory automatically"
echo ""

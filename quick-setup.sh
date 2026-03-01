#!/bin/bash

# Quick Setup Script for AI Code Reviewer Integration
# Usage: curl -sSL https://raw.githubusercontent.com/abhiac052/ai-code-reviewer/main/quick-setup.sh | bash

set -e

echo "🚀 Setting up AI Code Reviewer..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this from your project root."
    exit 1
fi

# Create tools directory if it doesn't exist
mkdir -p tools

# Clone or update the AI Code Reviewer
if [ -d "tools/ai-code-reviewer" ]; then
    echo "📦 Updating existing AI Code Reviewer..."
    cd tools/ai-code-reviewer
    git pull origin main
    npm install
    cd ../..
else
    echo "📦 Installing AI Code Reviewer..."
    git submodule add https://github.com/abhiac052/ai-code-reviewer.git tools/ai-code-reviewer
    cd tools/ai-code-reviewer
    npm install
    cd ../..
fi

# Add NPM scripts to package.json if it exists
if [ -f "package.json" ]; then
    echo "📝 Adding NPM scripts..."
    
    # Check if scripts section exists
    if ! grep -q '"scripts"' package.json; then
        # Add scripts section
        sed -i '' 's/{/{\n  "scripts": {},/' package.json
    fi
    
    # Add our scripts (basic approach - manual editing recommended)
    echo "
Add these scripts to your package.json:

\"review\": \"cd tools/ai-code-reviewer && npm run review -- --project=../../\",
\"review:diff\": \"cd tools/ai-code-reviewer && npm run review -- --diff --project=../../\",
\"review:security\": \"cd tools/ai-code-reviewer && npm run review -- --diff --security --project=../../\",
\"review:watch\": \"cd tools/ai-code-reviewer && npm run watch -- --project=../../\"
"
fi

# Create basic configuration
echo "⚙️ Creating configuration..."
cat > tools/ai-code-reviewer/config.json << EOF
{
  "projectRoot": "../../",
  "sourceDir": "src",
  "rules": {
    "security": { "enabled": true, "severity": "critical" },
    "performance": { "enabled": true },
    "react": { "enabled": true },
    "financial": { "enabled": false }
  },
  "ignore": [
    "**/*.test.js",
    "**/*.spec.js",
    "**/node_modules/**",
    "**/build/**",
    "**/dist/**"
  ]
}
EOF

# Create pre-commit hook
echo "🪝 Setting up pre-commit hook..."
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running AI Code Review..."

cd tools/ai-code-reviewer
npm run review -- --diff --project=../../

if [ $? -ne 0 ]; then
  echo "❌ Code review failed. Fix issues before committing."
  echo "Run 'npm run review:diff' to see details."
  exit 1
fi

echo "✅ Code review passed!"
EOF

chmod +x .git/hooks/pre-commit

# Create GitHub Actions workflow
echo "🤖 Setting up GitHub Actions..."
mkdir -p .github/workflows
cat > .github/workflows/ai-code-review.yml << 'EOF'
name: AI Code Review

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main ]

jobs:
  code-review:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        submodules: true
        
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install AI Code Reviewer
      run: |
        cd tools/ai-code-reviewer
        npm install
        
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Run Code Review
      run: |
        cd tools/ai-code-reviewer
        npm run review -- --diff --project=../../
EOF

echo "
✅ Setup Complete!

📋 Next Steps:

1. 🔑 Configure AWS credentials:
   aws configure
   
2. 🎯 Enable Bedrock models:
   - Go to AWS Console → Bedrock → Model Access
   - Enable Claude 3.5 Sonnet or Claude 3 Opus
   
3. 🧪 Test the setup:
   cd tools/ai-code-reviewer && npm run review -- --diff --project=../../
   
4. 📝 Add NPM scripts to package.json (see output above)

5. 🔐 Add GitHub secrets (for CI/CD):
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY

📚 Full documentation: tools/ai-code-reviewer/INTEGRATION_GUIDE.md

🚀 Happy coding!
"
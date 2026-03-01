# 🚀 Integration Guide: Using AI Code Reviewer in Your Projects

This guide shows you how to integrate the AI Code Reviewer into any JavaScript/React project for automated code quality checks.

## 📋 Quick Setup (5 minutes)

### Option 1: As a Git Submodule (Recommended)

```bash
# In your project root
git submodule add https://github.com/abhiac052/ai-code-reviewer.git tools/ai-code-reviewer
cd tools/ai-code-reviewer
npm install
```

### Option 2: Clone Separately

```bash
# Clone next to your project
git clone https://github.com/abhiac052/ai-code-reviewer.git
cd ai-code-reviewer
npm install
```

## ⚙️ Configuration

### 1. AWS Setup (Required)

The tool uses AWS Bedrock for AI analysis. Set up your AWS credentials:

```bash
# Option A: AWS CLI (Recommended)
aws configure
# Enter your AWS Access Key ID, Secret, and region

# Option B: Environment Variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### 2. Enable Bedrock Models

In AWS Console → Bedrock → Model Access:
- Enable `Claude 3.5 Sonnet` or `Claude 3 Opus`
- Wait for approval (usually instant)

### 3. Project Configuration

Create `ai-code-reviewer/config.json` in your project:

```json
{
  "projectRoot": "../",
  "sourceDir": "src",
  "rules": {
    "security": { "enabled": true, "severity": "critical" },
    "financial": { "enabled": false },
    "performance": { "enabled": true },
    "react": { "enabled": true }
  },
  "ignore": [
    "**/*.test.js",
    "**/*.spec.js", 
    "**/node_modules/**",
    "**/build/**"
  ]
}
```

## 🔧 Integration Methods

### Method 1: NPM Scripts (Easiest)

Add to your `package.json`:

```json
{
  "scripts": {
    "review": "cd tools/ai-code-reviewer && npm run review -- --project=../../",
    "review:diff": "cd tools/ai-code-reviewer && npm run review -- --diff --project=../../",
    "review:security": "cd tools/ai-code-reviewer && npm run review -- --diff --security --project=../../",
    "review:watch": "cd tools/ai-code-reviewer && npm run watch -- --project=../../"
  }
}
```

Usage:
```bash
npm run review:diff    # Review staged changes
npm run review:security # Security-focused review
npm run review:watch   # Real-time review
```

### Method 2: Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
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
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Method 3: GitHub Actions

Create `.github/workflows/code-review.yml`:

```yaml
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
```

Add these secrets in GitHub: Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Method 4: VS Code Integration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "AI Code Review: Current File",
      "type": "shell",
      "command": "cd tools/ai-code-reviewer && npm run review -- -f ${relativeFile}",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "AI Code Review: Staged Changes", 
      "type": "shell",
      "command": "cd tools/ai-code-reviewer && npm run review -- --diff --project=../../",
      "group": "build"
    }
  ]
}
```

Use: `Ctrl+Shift+P` → "Tasks: Run Task" → Select review task

## 📊 Usage Examples

### Basic Usage

```bash
# Review specific files
npm run review -- -f src/components/Login.jsx src/utils/api.js

# Review all staged changes
npm run review:diff

# Full project scan
npm run review -- --all

# Focus on security issues
npm run review:security

# Watch mode (real-time)
npm run review:watch
```

### Advanced Usage

```bash
# Custom configuration
npm run review -- --config=custom-config.json --diff

# Specific analyzers only
npm run review -- --diff --performance --react

# Output to file
npm run review -- --diff --output=review-report.json

# Verbose logging
npm run review -- --diff --verbose
```

## 🎯 Project-Specific Customization

### For React Projects

```json
{
  "rules": {
    "react": {
      "enabled": true,
      "checkHooks": true,
      "checkMemo": true,
      "checkKeys": true
    },
    "performance": {
      "enabled": true,
      "bundleSize": true,
      "memoryLeaks": true
    }
  }
}
```

### For Financial/Banking Apps

```json
{
  "rules": {
    "financial": {
      "enabled": true,
      "validatePAN": true,
      "validateFolio": true,
      "moneyPrecision": true
    },
    "security": {
      "enabled": true,
      "severity": "critical",
      "checkSecrets": true,
      "checkXSS": true
    }
  }
}
```

### For Node.js Backend

```json
{
  "rules": {
    "security": {
      "enabled": true,
      "checkInjection": true,
      "checkAuth": true
    },
    "performance": {
      "enabled": true,
      "checkAsync": true,
      "checkMemory": true
    },
    "react": { "enabled": false }
  }
}
```

## 🔍 Understanding Results

### Severity Levels

- **CRITICAL**: Security vulnerabilities, data loss risks
- **HIGH**: Performance issues, logic errors
- **MEDIUM**: Code quality, maintainability
- **LOW**: Style, minor optimizations

### Example Output

```
📊 Review Summary
  CRITICAL: 2
  HIGH: 5
  MEDIUM: 8

🔍 Issues Found:

1. [CRITICAL] Hardcoded API key detected
   File: src/config/api.js:12
   💡 Move to environment variables

2. [HIGH] Missing input validation
   File: src/components/LoginForm.jsx:45
   💡 Add validation for email and password fields
```

## 🚨 Troubleshooting

### Common Issues

**AWS Credentials Error**
```bash
# Check credentials
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

**Model Access Denied**
- Go to AWS Bedrock Console
- Enable Claude models in Model Access
- Wait for approval

**No Files Found**
```bash
# Check project structure
npm run review -- --verbose --project=../../
```

**Performance Issues**
```bash
# Use diff mode for faster reviews
npm run review:diff

# Focus on specific areas
npm run review -- --diff --security
```

## 📈 Best Practices

### 1. Start Small
```bash
# Begin with staged changes only
npm run review:diff
```

### 2. Focus Areas
```bash
# Security-critical features
npm run review:security

# Performance-sensitive components  
npm run review -- --diff --performance
```

### 3. Team Integration
- Add to CI/CD pipeline
- Set up pre-commit hooks
- Regular full scans (weekly)
- Share interesting findings

### 4. Gradual Adoption
- Week 1: Manual reviews
- Week 2: Pre-commit hooks
- Week 3: CI/CD integration
- Week 4: Real-time watching

## 🔧 Customization

### Custom Rules

Create `custom-analyzer.js`:

```javascript
export class CustomAnalyzer {
  constructor() {
    this.type = 'custom';
  }

  async analyze(filePath, content) {
    const issues = [];
    
    // Your custom logic
    if (content.includes('TODO')) {
      issues.push({
        severity: 'low',
        title: 'TODO comment found',
        line: this.findLine(content, 'TODO'),
        description: 'Consider creating a ticket for this TODO'
      });
    }
    
    return issues;
  }
}
```

### Team Configuration

Create team-specific config:

```json
{
  "team": "frontend",
  "rules": {
    "react": { "enabled": true },
    "accessibility": { "enabled": true },
    "performance": { "bundleSize": 500000 }
  },
  "notifications": {
    "slack": "https://hooks.slack.com/...",
    "email": ["team@company.com"]
  }
}
```

## 📞 Support

- **Issues**: Create GitHub issue
- **Questions**: Check existing issues
- **Feature Requests**: Open discussion

## 🎯 Next Steps

1. **Set up basic integration** (NPM scripts)
2. **Test with small changes** (review:diff)
3. **Add pre-commit hook**
4. **Configure CI/CD**
5. **Customize for your needs**

---

**Happy Coding! 🚀**
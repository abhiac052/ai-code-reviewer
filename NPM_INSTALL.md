# AI Code Reviewer - NPM Package Installation

## Install Once, Use Everywhere! 🚀

### Method 1: Global Installation (Recommended)

```bash
# From the ai-code-reviewer directory
cd /path/to/amc-investor-web-app/ai-code-reviewer
npm link

# Now use from ANY project
cd /path/to/any-project
ai-review review --flows
```

### Method 2: Install in Each Project

```bash
# In your project
cd /path/to/your-project
npm install --save-dev /path/to/amc-investor-web-app/ai-code-reviewer

# Add to package.json scripts
{
  "scripts": {
    "review": "ai-review review --flows",
    "review:all": "ai-review review -a"
  }
}

# Use it
npm run review
```

### Method 3: Publish to Private NPM (Team-wide)

```bash
# One-time setup
cd ai-code-reviewer
npm publish --registry=https://your-private-npm.com

# Team members install
npm install -g @motilal-oswal/ai-code-reviewer

# Use from anywhere
cd /path/to/any-project
ai-review review --flows
```

---

## Usage After Installation

### From Any Project Directory

```bash
# Navigate to your project
cd /path/to/any-project

# Review entire codebase
ai-review review -a

# Analyze flows
ai-review review --flows

# Review only changed files
ai-review review -d

# Focus on security
ai-review review -a --security

# Focus on financial rules
ai-review review -a --financial

# Open dashboard
ai-review dashboard
```

---

## How It Works

1. **You run the command** from your project root
2. **Tool scans** the `src/` directory automatically
3. **Analyzes** all `.js`, `.jsx`, `.ts`, `.tsx` files
4. **Shows results** in terminal or dashboard

---

## Example Workflow

```bash
# Install globally once
cd ~/Documents/Projects/amc-investor-web-app/ai-code-reviewer
npm link

# Use in Project A
cd ~/Projects/project-a
ai-review review --flows

# Use in Project B
cd ~/Projects/project-b
ai-review review -a --security

# Use in Project C
cd ~/Projects/project-c
ai-review review -d
```

---

## Uninstall

```bash
# If installed globally
npm unlink -g @motilal-oswal/ai-code-reviewer

# If installed in project
npm uninstall @motilal-oswal/ai-code-reviewer
```

---

## Benefits

✅ **Install once, use everywhere**  
✅ **No need to copy files**  
✅ **Automatic updates** (when you update the package)  
✅ **Same tool across all projects**  
✅ **Team can share the same installation**  

---

## Quick Start

```bash
# 1. Link globally
cd ai-code-reviewer && npm link

# 2. Go to any project
cd /path/to/your-project

# 3. Run review
ai-review review --flows

# Done! 🎉
```

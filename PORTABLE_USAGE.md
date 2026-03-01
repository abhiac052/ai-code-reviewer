# Using AI Code Reviewer in Other Projects

## Method 1: Copy to Another Project (Recommended)

```bash
# From your current project
cd /path/to/amc-investor-web-app/ai-code-reviewer

# Copy to another project
cp -r . /path/to/other-project/ai-code-reviewer

# Go to the new project
cd /path/to/other-project/ai-code-reviewer

# Install dependencies
npm install

# Use it
npm run review -- review --flows
```

---

## Method 2: Use From Anywhere

### Option A: Add to PATH
```bash
# Add to your ~/.zshrc or ~/.bashrc
export PATH="$PATH:/path/to/amc-investor-web-app/ai-code-reviewer"

# Then from any project
cd /path/to/any-project
ai-review review --flows
```

### Option B: Create Alias
```bash
# Add to ~/.zshrc or ~/.bashrc
alias ai-review="node /path/to/amc-investor-web-app/ai-code-reviewer/src/cli.js"

# Then from any project
cd /path/to/any-project
ai-review review --flows
```

---

## Method 3: NPM Global Install (Advanced)

```bash
# From ai-code-reviewer directory
npm link

# Now use from anywhere
cd /path/to/any-project
ai-review review --flows
```

---

## Method 4: Publish as NPM Package (Team-wide)

```bash
# Publish to private npm registry
npm publish --registry=https://your-private-registry.com

# Team members install
npm install -g @motilal-oswal/ai-code-reviewer

# Use from anywhere
cd /path/to/any-project
ai-review review --flows
```

---

## How It Works

The tool automatically detects the project structure:

1. **Looks for `src/` directory** in parent folder
2. **Scans all `.js`, `.jsx`, `.ts`, `.tsx` files**
3. **Discovers flows** based on file names and content
4. **Analyzes** using static + AI analysis

---

## Project-Specific Configuration

Create `.ai-reviewer.json` in your project root:

```json
{
  "srcDir": "src",
  "ignore": [
    "**/test/**",
    "**/stories/**",
    "**/node_modules/**"
  ],
  "flows": {
    "custom-flow": {
      "name": "Custom Flow",
      "patterns": ["custom", "special"]
    }
  }
}
```

---

## Examples

### Review Another React Project
```bash
cd /path/to/other-react-app
/path/to/ai-code-reviewer/src/cli.js review --flows
```

### Review Node.js Backend
```bash
cd /path/to/backend-api
/path/to/ai-code-reviewer/src/cli.js review --security
```

### Review Any JavaScript Project
```bash
cd /path/to/any-js-project
/path/to/ai-code-reviewer/src/cli.js review -a
```

---

## Quick Copy Command

```bash
# One-liner to copy to another project
cp -r /path/to/amc-investor-web-app/ai-code-reviewer /path/to/new-project/ && cd /path/to/new-project/ai-code-reviewer && npm install
```

---

## What Gets Analyzed

The tool works on **any JavaScript/TypeScript project** with:
- React, Vue, Angular, or vanilla JS
- Node.js backends
- Any project with `.js`, `.jsx`, `.ts`, `.tsx` files

It will:
- ✅ Find security issues
- ✅ Detect performance problems
- ✅ Check React best practices (if React project)
- ✅ Discover and analyze flows (if applicable)

---

## Recommended Approach

**For your team:**
1. Copy `ai-code-reviewer` folder to each project
2. Each project has its own copy
3. Customize rules per project if needed

**Benefits:**
- Each project can have different rules
- No dependency on central installation
- Easy to version control
- Team members just run `npm install`

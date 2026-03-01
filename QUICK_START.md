# 🚀 Quick Integration

## One-Line Setup

```bash
curl -sSL https://raw.githubusercontent.com/abhiac052/ai-code-reviewer/main/quick-setup.sh | bash
```

## Manual Setup (3 steps)

```bash
# 1. Add as submodule
git submodule add https://github.com/abhiac052/ai-code-reviewer.git tools/ai-code-reviewer
cd tools/ai-code-reviewer && npm install

# 2. Configure AWS
aws configure

# 3. Test
npm run review -- --diff --project=../../
```

## Usage

```bash
# Review staged changes
cd tools/ai-code-reviewer && npm run review -- --diff --project=../../

# Security focus
cd tools/ai-code-reviewer && npm run review -- --diff --security --project=../../

# Watch mode
cd tools/ai-code-reviewer && npm run watch -- --project=../../
```

## Add to package.json

```json
{
  "scripts": {
    "review": "cd tools/ai-code-reviewer && npm run review -- --project=../../",
    "review:diff": "cd tools/ai-code-reviewer && npm run review -- --diff --project=../../",
    "review:security": "cd tools/ai-code-reviewer && npm run review -- --diff --security --project=../../"
  }
}
```

Then use: `npm run review:diff`

📚 **Full Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
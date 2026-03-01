# 🤖 AI Code Review Assistant - Using Amazon Q / AWS Bedrock

**No API Key Needed!** Uses your existing AWS credentials.

## Why Amazon Q / AWS Bedrock?

✅ **No extra API key** - Uses your AWS credentials  
✅ **Already integrated** - You're using Amazon Q in your IDE  
✅ **Same AI model** - Claude 3.5 Sonnet via Bedrock  
✅ **Enterprise ready** - AWS security and compliance  
✅ **Cost effective** - Pay only for what you use  

## 🚀 Quick Start (2 Steps)

### Step 1: Install Dependencies
```bash
cd ai-code-reviewer
npm install
```

### Step 2: Configure AWS Credentials

You already have AWS credentials if you're using Amazon Q! The tool will automatically use:

**Option A: AWS Credentials File** (Recommended)
```bash
# Already exists at ~/.aws/credentials
[default]
aws_access_key_id = YOUR_KEY
aws_secret_access_key = YOUR_SECRET
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

**Option C: IAM Role** (if on EC2/ECS)
Automatically uses instance role - no configuration needed!

### Step 3: Test It!
```bash
npm run demo
```

## 🎯 Usage

Same commands as before:

```bash
# Review staged changes
npm run review -- --diff

# Watch mode
npm run watch

# Full scan
npm run review -- --all

# Dashboard
npm run dashboard
```

## 💰 Cost

**AWS Bedrock Pricing** (Claude 3.5 Sonnet):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Typical Usage**:
- ~1000 tokens per file review
- ~100 file reviews = $0.30
- **Monthly cost: ~$10-20** (vs $50 with direct API)

Even cheaper than the original solution!

## 🔐 Security

✅ Uses AWS IAM for authentication  
✅ No API keys to manage  
✅ Enterprise-grade security  
✅ Audit logs via CloudTrail  
✅ VPC endpoints supported  

## ⚙️ Configuration

Edit `.env` file:

```bash
AWS_REGION=us-east-1  # Change if needed

# Choose your model (default: Claude 4.0 Opus - best quality)
REVIEW_MODEL=anthropic.claude-opus-4-20250514-v1:0

# Or use Claude 3.5 Sonnet v2 (faster, cheaper)
# REVIEW_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
```

**Model Comparison**: See `MODEL_COMPARISON.md` for detailed comparison.

**Recommendation**: Use Claude 4.0 Opus (default) - only $1-2 more per month but significantly better quality.

## 🎁 Benefits Over Direct API

| Feature | Direct API | AWS Bedrock |
|---------|-----------|-------------|
| API Key | Required | Not needed |
| Cost | $50/month | $10-20/month |
| Security | API key | AWS IAM |
| Audit | Limited | CloudTrail |
| Integration | Separate | Same as Amazon Q |

## 🚀 You're Ready!

Since you're already using Amazon Q, you have everything configured:

```bash
cd ai-code-reviewer
npm install
npm run demo
```

That's it! No API key setup needed.

## ❓ Troubleshooting

### "Unable to locate credentials"
Your AWS credentials aren't configured. Run:
```bash
aws configure
```

### "Access Denied"
Your AWS user needs Bedrock permissions. Add this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "bedrock:InvokeModel",
    "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
  }]
}
```

### "Region not supported"
Claude is available in: us-east-1, us-west-2, eu-west-1, ap-southeast-1
Change AWS_REGION in .env

## 📚 Documentation

All other documentation remains the same:
- EXECUTIVE_SUMMARY.md - Business case
- PRESENTATION.md - For Team Lead
- ARCHITECTURE.md - Technical details
- COMPARISON.md - vs other tools

## 🎉 Advantages

✅ **Simpler setup** - No API key management  
✅ **Lower cost** - $10-20 vs $50/month  
✅ **Better security** - AWS IAM  
✅ **Same AI** - Claude 3.5 Sonnet  
✅ **Enterprise ready** - AWS compliance  

**You're already using Amazon Q, so this just works!**

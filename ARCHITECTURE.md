# AI Code Review Assistant - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Developer Workflow                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         Entry Points                     │
        ├─────────────────────────────────────────┤
        │  • CLI (npm run review)                 │
        │  • Watch Mode (real-time)               │
        │  • GitHub Actions (automated)           │
        │  • VS Code Tasks (IDE)                  │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      Code Reviewer Engine               │
        │         (src/index.js)                  │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │ Static Analyzers  │       │   AI Analysis     │
    │                   │       │   (Claude API)    │
    └───────────────────┘       └───────────────────┘
                │                           │
        ┌───────┴───────┐                  │
        ▼               ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Security    │ │ Performance  │ │ Deep Context │
│  Analyzer    │ │  Analyzer    │ │  Analysis    │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │                  │
        ▼               ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Financial   │ │    React     │ │  Suggestions │
│   Domain     │ │ Best Practice│ │  & Fixes     │
└──────────────┘ └──────────────┘ └──────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         Results Aggregation             │
        │  • Severity Classification              │
        │  • Deduplication                        │
        │  • Prioritization                       │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │  CLI Output       │       │  Web Dashboard    │
    │  • Console        │       │  • Visual Reports │
    │  • Exit Codes     │       │  • Metrics        │
    └───────────────────┘       └───────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │  GitHub Comments  │       │  Team Analytics   │
    │  • PR Reviews     │       │  • Trends         │
    │  • Block Merges   │       │  • Leaderboard    │
    └───────────────────┘       └───────────────────┘
```

## Data Flow

```
1. Code Input
   ├── Git Diff (staged changes)
   ├── Specific Files
   └── Full Codebase Scan

2. Static Analysis (Fast)
   ├── Security Patterns
   ├── Performance Anti-patterns
   ├── Financial Domain Rules
   └── React Best Practices

3. AI Analysis (Deep)
   ├── Context Understanding
   ├── Business Logic Validation
   ├── Complex Pattern Detection
   └── Fix Suggestions

4. Results Processing
   ├── Severity Assignment
   ├── Deduplication
   ├── Prioritization
   └── Formatting

5. Output Delivery
   ├── Terminal (CLI)
   ├── Dashboard (Web)
   ├── GitHub (PR Comments)
   └── IDE (VS Code)
```

## Component Breakdown

### 1. Security Analyzer
```
Input: Source Code
↓
Checks:
  • Hardcoded secrets (API keys, tokens)
  • XSS vulnerabilities (dangerouslySetInnerHTML)
  • Sensitive data logging (console.log with PAN/account)
  • Weak encryption (base64 vs RSA)
  • Insecure storage (localStorage with financial data)
↓
Output: Security Issues with Severity
```

### 2. Performance Analyzer
```
Input: React Components
↓
Checks:
  • Missing React.memo
  • Expensive calculations without useMemo
  • Inline callbacks without useCallback
  • Large library imports
  • Missing keys in lists
  • Unnecessary useEffect dependencies
↓
Output: Performance Optimization Suggestions
```

### 3. Financial Domain Analyzer
```
Input: Financial Components
↓
Checks:
  • Floating-point money calculations
  • Missing amount validation
  • Invalid PAN format
  • Missing folio validation
  • Transaction error handling
  • NAV date validation
  • SIP date validation (1-28)
↓
Output: Domain-Specific Issues
```

### 4. React Best Practices
```
Input: React Components
↓
Checks:
  • Missing PropTypes/TypeScript
  • Direct state mutation
  • Missing useEffect cleanup
  • Async functions in useEffect
  • Missing error boundaries
↓
Output: Best Practice Violations
```

### 5. AI Deep Analysis
```
Input: Code + Static Issues
↓
Process:
  • Understand context
  • Analyze business logic
  • Detect complex patterns
  • Generate specific fixes
↓
Output: Context-Aware Suggestions
```

## Integration Points

### GitHub Actions Workflow
```
PR Created/Updated
    ↓
Checkout Code
    ↓
Install Dependencies
    ↓
Run AI Review (--diff)
    ↓
Parse Results
    ↓
Comment on PR
    ↓
Block Merge if Critical Issues
```

### Watch Mode Flow
```
File Changed
    ↓
Debounce (500ms)
    ↓
Run Review on Changed File
    ↓
Display Results in Terminal
    ↓
Wait for Next Change
```

### Dashboard Flow
```
Review Completed
    ↓
POST /api/reviews
    ↓
Store in Memory
    ↓
Broadcast via WebSocket
    ↓
Update Dashboard UI
    ↓
Show Metrics & Issues
```

## Technology Stack

```
┌─────────────────────────────────────┐
│         Frontend (Dashboard)        │
│  • HTML5 + CSS3                     │
│  • Vanilla JavaScript               │
│  • WebSocket (real-time)            │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│         Backend (Node.js)           │
│  • Express.js (API)                 │
│  • WebSocket Server                 │
│  • Commander (CLI)                  │
│  • Chokidar (File Watching)         │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│         AI Integration              │
│  • Anthropic Claude API             │
│  • Model: claude-3-5-sonnet         │
│  • Max Tokens: 4096                 │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│         Utilities                   │
│  • simple-git (Git operations)      │
│  • glob (File matching)             │
│  • chalk (Terminal colors)          │
│  • ora (Spinners)                   │
└─────────────────────────────────────┘
```

## Scalability Considerations

### Current Design (Team of 5-10)
- In-memory result storage
- Single API key
- Local execution

### Future Scaling (Team of 20+)
- Database for results (PostgreSQL)
- API key rotation
- Distributed execution
- Caching layer (Redis)
- Queue system (Bull)

## Security & Privacy

```
Code → [Local Analysis] → [Encrypted API Call] → [AI Analysis] → [Results]
                                                                      ↓
                                                            [No Code Storage]
```

- Code analyzed in-memory only
- No persistent storage of source code
- API calls encrypted (HTTPS)
- Results stored temporarily
- Audit logs for compliance

## Performance Metrics

```
Static Analysis:  ~100ms per file
AI Analysis:      ~2-5s per file
Full Scan:        ~5-10 min (1000 files)
Diff Scan:        ~30s (10 files)
Watch Mode:       ~1-2s per change
```

## Error Handling

```
Error Occurs
    ↓
Categorize:
  • API Error → Retry with backoff
  • File Error → Skip and continue
  • Parse Error → Log and continue
  • Network Error → Fallback to static only
    ↓
Log Error
    ↓
Continue Processing
    ↓
Report Partial Results
```

## Extensibility

### Adding New Analyzers
```javascript
// src/analyzers/custom.js
export class CustomAnalyzer {
  constructor() {
    this.type = 'custom';
  }
  
  async analyze(filePath, content) {
    // Your logic
    return issues;
  }
}
```

### Custom Rules
```javascript
// config.json
{
  "customRules": [
    {
      "name": "no-console-in-production",
      "pattern": "console\\.(log|error)",
      "severity": "high",
      "message": "Remove console statements"
    }
  ]
}
```

---

This architecture is designed for:
- ✅ Easy maintenance
- ✅ Simple extensibility
- ✅ High performance
- ✅ Team scalability
- ✅ Future enhancements

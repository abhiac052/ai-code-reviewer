import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { simpleGit } from 'simple-git';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { SecurityAnalyzer } from './analyzers/security.js';
import { PerformanceAnalyzer } from './analyzers/performance.js';
import { FinancialDomainAnalyzer } from './analyzers/financial.js';
import { ReactBestPractices } from './analyzers/react.js';
import { FlowAnalyzer } from './analyzers/flow.js';

export class CodeReviewer {
  constructor(config = {}) {
    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.config = {
      model: process.env.REVIEW_MODEL || 'anthropic.claude-opus-4-20250514-v1:0',
      maxTokens: parseInt(process.env.MAX_TOKENS) || 8192,
      ...config
    };

    this.analyzers = [
      new SecurityAnalyzer(),
      new PerformanceAnalyzer(),
      new FinancialDomainAnalyzer(),
      new ReactBestPractices()
    ];

    this.flowAnalyzer = new FlowAnalyzer();
  }

  async review({ files, diffOnly, fullScan, analyzeFlows }) {
    const filesToReview = await this.getFilesToReview({ files, diffOnly, fullScan });
    const issues = [];

    // Flow analysis mode
    if (analyzeFlows) {
      console.log('🔍 Discovering flows...');
      const flows = await this.flowAnalyzer.discoverFlows();
      
      console.log(`\n📊 Found ${Object.keys(flows).length} flows:\n`);
      Object.entries(flows).forEach(([key, flow]) => {
        console.log(`  • ${flow.name}: ${flow.files.length} files`);
      });
      console.log('');

      // Analyze each flow
      for (const [flowName, flow] of Object.entries(flows)) {
        console.log(`🔍 Analyzing ${flow.name}...`);
        const flowIssues = await this.flowAnalyzer.analyzeFlow(flowName, flow.files);
        issues.push(...flowIssues);
      }

      return this.formatResults(issues);
    }

    // Regular file-by-file analysis
    for (const file of filesToReview) {
      const content = await fs.readFile(file, 'utf-8');
      const fileIssues = await this.analyzeFile(file, content);
      issues.push(...fileIssues);
    }

    return this.formatResults(issues);
  }

  async getFilesToReview({ files, diffOnly, fullScan }) {
    // Detect project root (where the command is run from)
    const projectRoot = process.cwd();
    const baseDir = 'src';

    console.log('🔍 Scanning from:', projectRoot);
    console.log('📁 Looking for:', `${projectRoot}/${baseDir}`);

    if (files?.length) {
      return files.map(f => path.resolve(projectRoot, f));
    }

    if (diffOnly) {
      const git = simpleGit(projectRoot);
      const diff = await git.diff(['--name-only', '--cached']);
      return diff.split('\n')
        .filter(f => f && this.isReviewableFile(f))
        .map(f => path.resolve(projectRoot, f));
    }

    if (fullScan) {
      const foundFiles = await glob(`${baseDir}/**/*.{js,jsx,ts,tsx}`, { 
        cwd: projectRoot,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.storybook/**', '**/stories/**']
      });
      console.log(`📊 Found ${foundFiles.length} files to review`);
      return foundFiles;
    }

    // Default: staged + modified files
    const git = simpleGit(projectRoot);
    const status = await git.status();
    return [...status.staged, ...status.modified]
      .filter(f => this.isReviewableFile(f))
      .map(f => path.resolve(projectRoot, f));
  }

  isReviewableFile(file) {
    const ext = path.extname(file);
    return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  }

  async analyzeFile(filePath, content) {
    const issues = [];

    // Run static analyzers
    for (const analyzer of this.analyzers) {
      if (this.shouldRunAnalyzer(analyzer)) {
        const analyzerIssues = await analyzer.analyze(filePath, content);
        issues.push(...analyzerIssues);
      }
    }

    // AI-powered deep analysis
    const aiIssues = await this.aiAnalysis(filePath, content, issues);
    issues.push(...aiIssues);

    return issues;
  }

  shouldRunAnalyzer(analyzer) {
    const { focusAreas } = this.config;
    if (!focusAreas) return true;
    
    if (focusAreas.security && analyzer.type === 'security') return true;
    if (focusAreas.performance && analyzer.type === 'performance') return true;
    if (focusAreas.financial && analyzer.type === 'financial') return true;
    
    return !Object.values(focusAreas).some(v => v);
  }

  async aiAnalysis(filePath, content, staticIssues) {
    const prompt = this.buildPrompt(filePath, content, staticIssues);

    try {
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: this.config.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      };

      const command = new InvokeModelCommand({
        modelId: this.config.model,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await this.bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return this.parseAIResponse(responseBody.content[0].text, filePath);
    } catch (error) {
      console.error('AI analysis failed:', error.message);
      return [];
    }
  }

  buildPrompt(filePath, content, staticIssues) {
    return `You are a senior code reviewer for a financial services application (AMC Investor Web App).

Review this file: ${filePath}

CODE:
\`\`\`
${content}
\`\`\`

STATIC ANALYSIS FINDINGS:
${staticIssues.map(i => `- [${i.severity}] ${i.title}`).join('\n') || 'None'}

Focus on:
1. Security vulnerabilities (XSS, injection, data exposure)
2. Financial calculation accuracy
3. React best practices and performance
4. Redux state management issues
5. API error handling
6. Accessibility compliance
7. Memory leaks and performance bottlenecks

Return ONLY a JSON array of issues:
[
  {
    "severity": "critical|high|medium|low",
    "title": "Brief issue title",
    "description": "Detailed explanation",
    "line": line_number,
    "suggestion": "How to fix"
  }
]

If no issues found, return: []`;
  }

  parseAIResponse(text, filePath) {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      
      const issues = JSON.parse(jsonMatch[0]);
      return issues.map(issue => ({
        ...issue,
        file: filePath,
        source: 'ai'
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      return [];
    }
  }

  formatResults(issues) {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    issues.forEach(issue => {
      summary[issue.severity]++;
    });

    return {
      summary,
      issues: issues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      timestamp: new Date().toISOString()
    };
  }
}

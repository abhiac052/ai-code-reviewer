export class ReactBestPractices {
  constructor() {
    this.type = 'react';
  }

  async analyze(filePath, content) {
    const issues = [];

    // Missing PropTypes or TypeScript types
    if (!filePath.endsWith('.tsx') && !content.includes('PropTypes')) {
      issues.push({
        severity: 'low',
        title: 'Missing prop validation',
        description: 'Component props should be validated with PropTypes or TypeScript',
        line: this.findComponentLine(content),
        file: filePath,
        suggestion: 'Add PropTypes or convert to TypeScript',
        source: 'react'
      });
    }

    // Direct state mutation
    if (this.hasDirectStateMutation(content)) {
      issues.push({
        severity: 'high',
        title: 'Direct state mutation detected',
        description: 'Mutating state directly breaks React\'s reactivity',
        line: this.findLineNumber(content, /state\.\w+\s*=/),
        file: filePath,
        suggestion: 'Use setState or state setter functions',
        source: 'react'
      });
    }

    // Missing cleanup in useEffect
    if (this.needsCleanup(content) && !this.hasCleanup(content)) {
      issues.push({
        severity: 'medium',
        title: 'Missing cleanup in useEffect',
        description: 'Effects with subscriptions, timers, or listeners need cleanup',
        line: this.findLineNumber(content, /useEffect/),
        file: filePath,
        suggestion: 'Return cleanup function from useEffect',
        source: 'react'
      });
    }

    // Async function in useEffect
    if (content.match(/useEffect\(\s*async/)) {
      issues.push({
        severity: 'medium',
        title: 'Async function directly in useEffect',
        description: 'useEffect cannot be async; create async function inside',
        line: this.findLineNumber(content, /useEffect\(\s*async/),
        file: filePath,
        suggestion: 'Create async function inside useEffect and call it',
        source: 'react'
      });
    }

    // Missing error boundary
    if (this.isPageComponent(filePath) && !content.includes('ErrorBoundary')) {
      issues.push({
        severity: 'low',
        title: 'Page component without error boundary',
        description: 'Page-level components should be wrapped in error boundaries',
        line: 1,
        file: filePath,
        suggestion: 'Wrap component with ErrorBoundary',
        source: 'react'
      });
    }

    return issues;
  }

  hasDirectStateMutation(content) {
    return /state\.\w+\s*=/.test(content) && !content.includes('useState');
  }

  needsCleanup(content) {
    const cleanupPatterns = [
      /addEventListener/,
      /setInterval/,
      /setTimeout/,
      /subscribe/,
      /WebSocket/
    ];
    return cleanupPatterns.some(p => p.test(content));
  }

  hasCleanup(content) {
    return /return\s*\(\s*\)\s*=>/.test(content) || /return\s*function/.test(content);
  }

  isPageComponent(filePath) {
    return filePath.includes('/pages/') || filePath.includes('/screens/');
  }

  findComponentLine(content) {
    const lines = content.split('\n');
    const index = lines.findIndex(l => 
      /^(export\s+)?(default\s+)?function/.test(l.trim()) ||
      /^const.*=.*\(.*\)\s*=>/.test(l.trim())
    );
    return index >= 0 ? index + 1 : 1;
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    const index = lines.findIndex(line => pattern.test(line));
    return index >= 0 ? index + 1 : 1;
  }
}

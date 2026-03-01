export class SecurityAnalyzer {
  constructor() {
    this.type = 'security';
  }

  async analyze(filePath, content) {
    const issues = [];

    // Check for sensitive data exposure
    if (this.hasSensitiveDataLogging(content)) {
      issues.push({
        severity: 'critical',
        title: 'Potential sensitive data logging',
        description: 'Console.log or logging statements may expose PAN, account numbers, or financial data',
        line: this.findLineNumber(content, /console\.(log|error|warn)/),
        file: filePath,
        suggestion: 'Remove console.log in production or sanitize sensitive data before logging',
        source: 'security'
      });
    }

    // Check for hardcoded credentials
    if (this.hasHardcodedSecrets(content)) {
      issues.push({
        severity: 'critical',
        title: 'Hardcoded credentials or API keys detected',
        description: 'Found potential API keys, passwords, or tokens in code',
        line: this.findLineNumber(content, /(api[_-]?key|password|secret|token)\s*[:=]/i),
        file: filePath,
        suggestion: 'Move credentials to environment variables',
        source: 'security'
      });
    }

    // Check for unsafe innerHTML usage
    if (content.includes('dangerouslySetInnerHTML') || content.includes('innerHTML')) {
      issues.push({
        severity: 'high',
        title: 'XSS vulnerability: Unsafe HTML rendering',
        description: 'Using dangerouslySetInnerHTML or innerHTML can lead to XSS attacks',
        line: this.findLineNumber(content, /dangerouslySetInnerHTML|innerHTML/),
        file: filePath,
        suggestion: 'Sanitize HTML content or use safe rendering methods',
        source: 'security'
      });
    }

    // Check for eval usage
    if (content.match(/\beval\s*\(/)) {
      issues.push({
        severity: 'critical',
        title: 'Code injection risk: eval() usage',
        description: 'eval() can execute arbitrary code and is a major security risk',
        line: this.findLineNumber(content, /\beval\s*\(/),
        file: filePath,
        suggestion: 'Remove eval() and use safer alternatives',
        source: 'security'
      });
    }

    // Check for weak encryption
    if (content.match(/btoa|atob/) && !content.includes('RSA')) {
      issues.push({
        severity: 'high',
        title: 'Weak encoding detected',
        description: 'Base64 encoding (btoa/atob) is not encryption and provides no security',
        line: this.findLineNumber(content, /btoa|atob/),
        file: filePath,
        suggestion: 'Use proper encryption (RSA) for sensitive financial data',
        source: 'security'
      });
    }

    // Check for localStorage with sensitive data
    if (content.match(/localStorage\.(setItem|getItem)/) && this.isFinancialComponent(content)) {
      issues.push({
        severity: 'high',
        title: 'Sensitive data in localStorage',
        description: 'localStorage is not secure for financial data (PAN, account numbers, amounts)',
        line: this.findLineNumber(content, /localStorage\./),
        file: filePath,
        suggestion: 'Use encrypted session storage or secure backend storage',
        source: 'security'
      });
    }

    return issues;
  }

  hasSensitiveDataLogging(content) {
    const sensitivePatterns = [
      /console\.log.*\b(pan|account|folio|amount|balance)\b/i,
      /console\.(log|error|warn).*userInfo/i,
      /console\.log.*password/i
    ];
    return sensitivePatterns.some(pattern => pattern.test(content));
  }

  hasHardcodedSecrets(content) {
    const secretPatterns = [
      /['"](?:AKIA|sk_live|pk_live|rzp_)[A-Za-z0-9]{20,}['"]/,
      /(api[_-]?key|password|secret|token)\s*[:=]\s*['"][^'"]{10,}['"]/i
    ];
    return secretPatterns.some(pattern => pattern.test(content));
  }

  isFinancialComponent(content) {
    const financialKeywords = ['transaction', 'payment', 'folio', 'pan', 'account', 'amount', 'balance'];
    return financialKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    const index = lines.findIndex(line => pattern.test(line));
    return index >= 0 ? index + 1 : 1;
  }
}

export class FinancialDomainAnalyzer {
  constructor() {
    this.type = 'financial';
  }

  async analyze(filePath, content) {
    const issues = [];

    // Floating point arithmetic for money
    if (this.hasFloatingPointMoney(content)) {
      issues.push({
        severity: 'critical',
        title: 'Floating-point arithmetic for financial calculations',
        description: 'Using floating-point numbers for money can cause precision errors',
        line: this.findLineNumber(content, /amount\s*[+\-*/]/i),
        file: filePath,
        suggestion: 'Use integer arithmetic (paise/cents) or decimal.js library for financial calculations',
        source: 'financial'
      });
    }

    // Missing amount validation
    if (this.hasAmountWithoutValidation(content)) {
      issues.push({
        severity: 'high',
        title: 'Missing amount validation',
        description: 'Financial amounts should be validated for negative values, NaN, and limits',
        line: this.findLineNumber(content, /amount|balance|value/i),
        file: filePath,
        suggestion: 'Add validation: amount > 0, !isNaN(amount), amount <= MAX_LIMIT',
        source: 'financial'
      });
    }

    // PAN number without validation
    if (content.includes('pan') && !this.hasPANValidation(content)) {
      issues.push({
        severity: 'high',
        title: 'PAN number without proper validation',
        description: 'PAN should be validated with regex pattern [A-Z]{5}[0-9]{4}[A-Z]{1}',
        line: this.findLineNumber(content, /pan/i),
        file: filePath,
        suggestion: 'Add PAN validation: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)',
        source: 'financial'
      });
    }

    // Missing transaction error handling
    if (this.isTransactionComponent(content) && !this.hasProperErrorHandling(content)) {
      issues.push({
        severity: 'high',
        title: 'Insufficient error handling for transactions',
        description: 'Transaction flows must handle all error scenarios (network, validation, payment)',
        line: this.findComponentLine(content),
        file: filePath,
        suggestion: 'Add try-catch blocks and user-friendly error messages for all transaction steps',
        source: 'financial'
      });
    }

    // Missing audit trail
    if (this.isTransactionComponent(content) && !content.includes('log') && !content.includes('audit')) {
      issues.push({
        severity: 'medium',
        title: 'Missing audit trail for financial transaction',
        description: 'All financial transactions should be logged for compliance and debugging',
        line: this.findComponentLine(content),
        file: filePath,
        suggestion: 'Add transaction logging with timestamp, user, and transaction details',
        source: 'financial'
      });
    }

    // Folio number validation
    if (content.includes('folio') && !this.hasFolioValidation(content)) {
      issues.push({
        severity: 'medium',
        title: 'Folio number without validation',
        description: 'Folio numbers should be validated before processing transactions',
        line: this.findLineNumber(content, /folio/i),
        file: filePath,
        suggestion: 'Validate folio format and existence before transactions',
        source: 'financial'
      });
    }

    // Date handling for NAV
    if (content.includes('nav') && !this.hasProperDateHandling(content)) {
      issues.push({
        severity: 'medium',
        title: 'NAV calculation without proper date handling',
        description: 'NAV is date-specific; ensure proper date validation and timezone handling',
        line: this.findLineNumber(content, /nav/i),
        file: filePath,
        suggestion: 'Use proper date libraries and validate NAV date against business days',
        source: 'financial'
      });
    }

    // SIP date validation
    if (content.includes('sip') && content.includes('date')) {
      issues.push({
        severity: 'medium',
        title: 'SIP date validation needed',
        description: 'SIP dates should be validated (1-28 for monthly, business days)',
        line: this.findLineNumber(content, /sip.*date|date.*sip/i),
        file: filePath,
        suggestion: 'Validate SIP dates: 1-28 for monthly, check against holidays',
        source: 'financial'
      });
    }

    return issues;
  }

  hasFloatingPointMoney(content) {
    const moneyVars = ['amount', 'balance', 'value', 'price', 'nav', 'units'];
    return moneyVars.some(v => {
      const pattern = new RegExp(`${v}\\s*[+\\-*/]`, 'i');
      return pattern.test(content) && !content.includes('Math.round') && !content.includes('toFixed');
    });
  }

  hasAmountWithoutValidation(content) {
    const hasAmount = /amount|balance|value/i.test(content);
    const hasValidation = /amount\s*>\s*0|isNaN.*amount|amount.*validation/i.test(content);
    return hasAmount && !hasValidation;
  }

  hasPANValidation(content) {
    return /\[A-Z\]\{5\}/.test(content) || /pan.*test|validate.*pan/i.test(content);
  }

  hasFolioValidation(content) {
    return /folio.*validation|validate.*folio|folio.*test/i.test(content);
  }

  hasProperDateHandling(content) {
    return /dayjs|moment|date-fns/.test(content) || /new Date\(/.test(content);
  }

  isTransactionComponent(content) {
    const txKeywords = ['purchase', 'redemption', 'switch', 'stp', 'payment', 'transaction'];
    return txKeywords.some(k => content.toLowerCase().includes(k));
  }

  hasProperErrorHandling(content) {
    const hasTryCatch = /try\s*\{[\s\S]*catch/.test(content);
    const hasErrorState = /error|isError|errorMessage/.test(content);
    return hasTryCatch && hasErrorState;
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

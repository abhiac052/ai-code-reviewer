import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class FlowAnalyzer {
  constructor() {
    this.type = 'flow';
    this.flows = {};
  }

  /**
   * Discover flows by analyzing file patterns and imports
   */
  async discoverFlows(baseDir = 'src') {
    const projectRoot = process.cwd();
    const srcPath = path.join(projectRoot, baseDir);
    
    console.log('🔍 Scanning directory:', srcPath);
    
    const flows = {
      sip: { name: 'SIP Journey', files: [], steps: [] },
      lumpsum: { name: 'Lumpsum Journey', files: [], steps: [] },
      cart: { name: 'Cart Journey', files: [], steps: [] },
      distributor: { name: 'Distributor URL Journey', files: [], steps: [] },
      redemption: { name: 'Redemption Journey', files: [], steps: [] },
      switch: { name: 'Switch Journey', files: [], steps: [] },
      stp: { name: 'STP Journey', files: [], steps: [] },
      purchase: { name: 'Purchase Journey', files: [], steps: [] },
      mandate: { name: 'Mandate Journey', files: [], steps: [] },
      payment: { name: 'Payment Journey', files: [], steps: [] }
    };

    // Find all relevant files
    const allFiles = await glob(`${baseDir}/**/*.{js,jsx,ts,tsx}`, {
      cwd: projectRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    
    console.log(`📂 Found ${allFiles.length} total files`);

    // Categorize files by flow
    for (const file of allFiles) {
      const fileName = path.basename(file).toLowerCase();
      const fileContent = await fs.readFile(file, 'utf-8').catch(() => '');

      // SIP Flow
      if (fileName.includes('sip') || fileContent.includes('SIP') || fileContent.includes('systematic')) {
        flows.sip.files.push(file);
      }

      // Lumpsum Flow
      if (fileName.includes('lumpsum') || fileName.includes('onetime') || fileContent.includes('lumpsum')) {
        flows.lumpsum.files.push(file);
      }

      // Cart Flow
      if (fileName.includes('cart') || fileContent.includes('addToCart') || fileContent.includes('cartItems')) {
        flows.cart.files.push(file);
      }

      // Distributor Flow
      if (fileName.includes('distributor') || fileContent.includes('distributorCode') || fileContent.includes('arn')) {
        flows.distributor.files.push(file);
      }

      // Redemption Flow
      if (fileName.includes('redemption') || fileName.includes('redeem') || fileContent.includes('redemption')) {
        flows.redemption.files.push(file);
      }

      // Switch Flow
      if (fileName.includes('switch') && !fileName.includes('switchcase')) {
        flows.switch.files.push(file);
      }

      // STP Flow
      if (fileName.includes('stp') || fileContent.includes('STP')) {
        flows.stp.files.push(file);
      }

      // Purchase Flow
      if (fileName.includes('purchase') || fileName.includes('invest')) {
        flows.purchase.files.push(file);
      }

      // Mandate Flow
      if (fileName.includes('mandate') || fileName.includes('emandate')) {
        flows.mandate.files.push(file);
      }

      // Payment Flow
      if (fileName.includes('payment') || fileName.includes('razorpay') || fileContent.includes('payment')) {
        flows.payment.files.push(file);
      }
    }

    // Remove empty flows
    Object.keys(flows).forEach(key => {
      if (flows[key].files.length === 0) {
        delete flows[key];
      }
    });

    this.flows = flows;
    return flows;
  }

  /**
   * Analyze a specific flow for issues
   */
  async analyzeFlow(flowName, files) {
    const issues = [];

    // Read all files in the flow
    const fileContents = await Promise.all(
      files.map(async (file) => ({
        path: file,
        content: await fs.readFile(file, 'utf-8').catch(() => '')
      }))
    );

    // Flow-specific checks
    switch (flowName) {
      case 'sip':
        issues.push(...this.analyzeSIPFlow(fileContents));
        break;
      case 'cart':
        issues.push(...this.analyzeCartFlow(fileContents));
        break;
      case 'distributor':
        issues.push(...this.analyzeDistributorFlow(fileContents));
        break;
      case 'payment':
        issues.push(...this.analyzePaymentFlow(fileContents));
        break;
      case 'purchase':
        issues.push(...this.analyzePurchaseFlow(fileContents));
        break;
      default:
        issues.push(...this.analyzeGenericFlow(fileContents));
    }

    return issues;
  }

  /**
   * SIP Flow specific checks
   */
  analyzeSIPFlow(files) {
    const issues = [];

    files.forEach(({ path: filePath, content }) => {
      // Check SIP date validation
      if (content.includes('sipDate') && !content.match(/sipDate.*[<>]=.*28/)) {
        issues.push({
          severity: 'high',
          title: 'SIP Flow: Missing date validation',
          description: 'SIP dates must be validated (1-28 for monthly)',
          file: filePath,
          line: this.findLineNumber(content, /sipDate/),
          suggestion: 'Add validation: if (sipDate < 1 || sipDate > 28) throw error',
          source: 'flow'
        });
      }

      // Check mandate validation before SIP
      if (content.includes('createSIP') && !content.includes('mandate')) {
        issues.push({
          severity: 'critical',
          title: 'SIP Flow: Missing mandate check',
          description: 'SIP creation must verify active mandate exists',
          file: filePath,
          line: this.findLineNumber(content, /createSIP/),
          suggestion: 'Check mandate status before allowing SIP creation',
          source: 'flow'
        });
      }

      // Check minimum amount validation
      if (content.includes('sipAmount') && !content.match(/amount.*>=.*500/)) {
        issues.push({
          severity: 'medium',
          title: 'SIP Flow: Missing minimum amount check',
          description: 'SIP amount should have minimum validation',
          file: filePath,
          line: this.findLineNumber(content, /sipAmount/),
          suggestion: 'Add validation: if (amount < 500) show error',
          source: 'flow'
        });
      }
    });

    return issues;
  }

  /**
   * Cart Flow specific checks
   */
  analyzeCartFlow(files) {
    const issues = [];

    files.forEach(({ path: filePath, content }) => {
      // Check cart total calculation
      if (content.match(/total.*\+.*amount/) && !content.includes('Math.round')) {
        issues.push({
          severity: 'critical',
          title: 'Cart Flow: Floating-point total calculation',
          description: 'Cart total calculation may have precision errors',
          file: filePath,
          line: this.findLineNumber(content, /total.*\+/),
          suggestion: 'Use integer arithmetic or Math.round for cart totals',
          source: 'flow'
        });
      }

      // Check cart persistence
      if (content.includes('cart') && !content.includes('localStorage') && !content.includes('sessionStorage')) {
        issues.push({
          severity: 'medium',
          title: 'Cart Flow: No cart persistence',
          description: 'Cart data not persisted - user loses cart on refresh',
          file: filePath,
          line: 1,
          suggestion: 'Add cart persistence with encrypted localStorage',
          source: 'flow'
        });
      }

      // Check cart validation before checkout
      if (content.includes('checkout') && !content.includes('validate')) {
        issues.push({
          severity: 'high',
          title: 'Cart Flow: Missing cart validation',
          description: 'Cart should be validated before proceeding to payment',
          file: filePath,
          line: this.findLineNumber(content, /checkout/),
          suggestion: 'Add cart validation: check items, amounts, availability',
          source: 'flow'
        });
      }
    });

    return issues;
  }

  /**
   * Distributor Flow specific checks
   */
  analyzeDistributorFlow(files) {
    const issues = [];

    files.forEach(({ path: filePath, content }) => {
      // Check token validation
      if (content.includes('distributorToken') && !content.includes('verify')) {
        issues.push({
          severity: 'critical',
          title: 'Distributor Flow: Missing token validation',
          description: 'Distributor tokens must be validated server-side',
          file: filePath,
          line: this.findLineNumber(content, /distributorToken/),
          suggestion: 'Add server-side token verification before processing',
          source: 'flow'
        });
      }

      // Check ARN code validation
      if (content.includes('arn') && !content.match(/arn.*test|validate/i)) {
        issues.push({
          severity: 'high',
          title: 'Distributor Flow: Missing ARN validation',
          description: 'ARN code should be validated against registered distributors',
          file: filePath,
          line: this.findLineNumber(content, /arn/i),
          suggestion: 'Validate ARN code format and registration status',
          source: 'flow'
        });
      }

      // Check commission calculation
      if (content.includes('commission') && content.match(/commission.*\*/)) {
        issues.push({
          severity: 'critical',
          title: 'Distributor Flow: Floating-point commission calculation',
          description: 'Commission calculation may have precision errors',
          file: filePath,
          line: this.findLineNumber(content, /commission.*\*/),
          suggestion: 'Use integer arithmetic for commission calculations',
          source: 'flow'
        });
      }
    });

    return issues;
  }

  /**
   * Payment Flow specific checks
   */
  analyzePaymentFlow(files) {
    const issues = [];

    files.forEach(({ path: filePath, content }) => {
      // Check payment amount validation
      if (content.includes('payment') && !content.includes('amount > 0')) {
        issues.push({
          severity: 'critical',
          title: 'Payment Flow: Missing amount validation',
          description: 'Payment amount must be validated before processing',
          file: filePath,
          line: this.findLineNumber(content, /payment/),
          suggestion: 'Validate: amount > 0, !isNaN(amount), amount <= MAX_LIMIT',
          source: 'flow'
        });
      }

      // Check payment gateway error handling
      if (content.includes('razorpay') && !content.includes('catch')) {
        issues.push({
          severity: 'high',
          title: 'Payment Flow: Missing error handling',
          description: 'Payment gateway calls must have proper error handling',
          file: filePath,
          line: this.findLineNumber(content, /razorpay/),
          suggestion: 'Add try-catch and handle payment failures gracefully',
          source: 'flow'
        });
      }

      // Check payment confirmation
      if (content.includes('payment') && !content.includes('confirm')) {
        issues.push({
          severity: 'high',
          title: 'Payment Flow: Missing payment confirmation',
          description: 'Payment status should be confirmed before proceeding',
          file: filePath,
          line: this.findLineNumber(content, /payment/),
          suggestion: 'Verify payment status from gateway before marking success',
          source: 'flow'
        });
      }
    });

    return issues;
  }

  /**
   * Purchase Flow specific checks
   */
  analyzePurchaseFlow(files) {
    const issues = [];

    files.forEach(({ path: filePath, content }) => {
      // Check folio selection
      if (content.includes('purchase') && !content.includes('folio')) {
        issues.push({
          severity: 'medium',
          title: 'Purchase Flow: Missing folio handling',
          description: 'Purchase flow should handle folio selection/creation',
          file: filePath,
          line: this.findLineNumber(content, /purchase/),
          suggestion: 'Add folio selection or new folio creation option',
          source: 'flow'
        });
      }

      // Check KYC validation
      if (content.includes('purchase') && !content.includes('kyc')) {
        issues.push({
          severity: 'high',
          title: 'Purchase Flow: Missing KYC check',
          description: 'Purchase must verify KYC status before proceeding',
          file: filePath,
          line: this.findLineNumber(content, /purchase/),
          suggestion: 'Check KYC status and block purchase if not completed',
          source: 'flow'
        });
      }
    });

    return issues;
  }

  /**
   * Generic flow checks
   */
  analyzeGenericFlow(files) {
    const issues = [];

    files.forEach(({ path: filePath, content }) => {
      // Check error handling consistency
      const hasTryCatch = /try\s*\{[\s\S]*catch/.test(content);
      const hasErrorState = /error|isError|errorMessage/.test(content);
      
      if (!hasTryCatch && !hasErrorState) {
        issues.push({
          severity: 'medium',
          title: 'Flow: Missing error handling',
          description: 'Flow should have consistent error handling',
          file: filePath,
          line: 1,
          suggestion: 'Add try-catch blocks and error state management',
          source: 'flow'
        });
      }

      // Check loading states
      if (!content.includes('loading') && !content.includes('isLoading')) {
        issues.push({
          severity: 'low',
          title: 'Flow: Missing loading states',
          description: 'Flow should show loading indicators during async operations',
          file: filePath,
          line: 1,
          suggestion: 'Add loading state to improve user experience',
          source: 'flow'
        });
      }
    });

    return issues;
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    const index = lines.findIndex(line => pattern.test(line));
    return index >= 0 ? index + 1 : 1;
  }
}

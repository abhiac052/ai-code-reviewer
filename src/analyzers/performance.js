export class PerformanceAnalyzer {
  constructor() {
    this.type = 'performance';
  }

  async analyze(filePath, content) {
    const issues = [];

    // Missing React.memo for expensive components
    if (this.isExpensiveComponent(content) && !content.includes('React.memo') && !content.includes('memo(')) {
      issues.push({
        severity: 'medium',
        title: 'Missing React.memo optimization',
        description: 'Component with complex logic should be memoized to prevent unnecessary re-renders',
        line: this.findComponentLine(content),
        file: filePath,
        suggestion: 'Wrap component with React.memo() or use useMemo for expensive calculations',
        source: 'performance'
      });
    }

    // Missing useMemo for expensive calculations
    if (this.hasExpensiveCalculation(content) && !content.includes('useMemo')) {
      issues.push({
        severity: 'medium',
        title: 'Expensive calculation without useMemo',
        description: 'Array operations (map, filter, reduce) in render may cause performance issues',
        line: this.findLineNumber(content, /\.(map|filter|reduce)\(/),
        file: filePath,
        suggestion: 'Wrap expensive calculations with useMemo hook',
        source: 'performance'
      });
    }

    // Missing useCallback for event handlers
    if (this.hasInlineCallbacks(content)) {
      issues.push({
        severity: 'low',
        title: 'Inline callback functions',
        description: 'Inline arrow functions in JSX create new references on each render',
        line: this.findLineNumber(content, /onClick=\{.*=>/),
        file: filePath,
        suggestion: 'Use useCallback for event handlers passed to child components',
        source: 'performance'
      });
    }

    // Large bundle imports
    if (this.hasLargeLibraryImports(content)) {
      issues.push({
        severity: 'medium',
        title: 'Non-optimized library imports',
        description: 'Importing entire libraries increases bundle size',
        line: this.findLineNumber(content, /import .* from ['"]lodash['"]/),
        file: filePath,
        suggestion: 'Use tree-shakeable imports: import debounce from "lodash/debounce"',
        source: 'performance'
      });
    }

    // Missing key prop in lists
    if (content.match(/\.map\(.*=>\s*</) && !content.includes('key=')) {
      issues.push({
        severity: 'high',
        title: 'Missing key prop in list rendering',
        description: 'Lists without keys cause React to re-render all items on changes',
        line: this.findLineNumber(content, /\.map\(/),
        file: filePath,
        suggestion: 'Add unique key prop to list items',
        source: 'performance'
      });
    }

    // Unnecessary useEffect dependencies
    if (this.hasUnnecessaryEffectDeps(content)) {
      issues.push({
        severity: 'medium',
        title: 'Potential unnecessary useEffect re-runs',
        description: 'useEffect with object/array dependencies may run on every render',
        line: this.findLineNumber(content, /useEffect\(/),
        file: filePath,
        suggestion: 'Use primitive values or useMemo for object dependencies',
        source: 'performance'
      });
    }

    return issues;
  }

  isExpensiveComponent(content) {
    const expensivePatterns = [
      /useSelector/g,
      /\.map\(/g,
      /\.filter\(/g,
      /\.reduce\(/g
    ];
    return expensivePatterns.filter(p => content.match(p)).length >= 3;
  }

  hasExpensiveCalculation(content) {
    const lines = content.split('\n');
    const returnIndex = lines.findIndex(l => l.trim().startsWith('return'));
    if (returnIndex === -1) return false;
    
    const renderSection = lines.slice(returnIndex).join('\n');
    return /\.(map|filter|reduce|sort)\(/.test(renderSection);
  }

  hasInlineCallbacks(content) {
    return /onClick=\{.*=>/.test(content) || /onChange=\{.*=>/.test(content);
  }

  hasLargeLibraryImports(content) {
    const largeLibs = ['lodash', 'moment', 'date-fns'];
    return largeLibs.some(lib => {
      const pattern = new RegExp(`import .* from ['"]${lib}['"]`);
      return pattern.test(content);
    });
  }

  hasUnnecessaryEffectDeps(content) {
    const effectMatch = content.match(/useEffect\([^,]+,\s*\[([^\]]+)\]/);
    if (!effectMatch) return false;
    
    const deps = effectMatch[1];
    return /\{|\[/.test(deps); // Has object or array literal
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

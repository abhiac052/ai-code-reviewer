#!/usr/bin/env node

/**
 * Quick test of VoiceAssistant.jsx
 * Demonstrates what issues the AI Code Reviewer finds
 */

import { CodeReviewer } from './src/index.js';
import chalk from 'chalk';
import fs from 'fs/promises';

async function testVoiceAssistant() {
  console.log(chalk.bold.blue('\n🎤 Testing VoiceAssistant.jsx\n'));
  
  const filePath = '../src/components/common/VoiceAssistant.jsx';
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    console.log(chalk.gray('Analyzing VoiceAssistant component...\n'));
    
    const reviewer = new CodeReviewer();
    const results = await reviewer.review({ 
      files: [filePath]
    });
    
    // Display results
    console.log(chalk.bold('📊 Analysis Results\n'));
    
    const { summary, issues } = results;
    const colors = { critical: 'red', high: 'yellow', medium: 'blue', low: 'gray' };
    
    // Summary
    let totalIssues = 0;
    Object.entries(summary).forEach(([severity, count]) => {
      totalIssues += count;
      if (count > 0) {
        console.log(chalk[colors[severity]](`  ${severity.toUpperCase()}: ${count}`));
      }
    });
    
    if (totalIssues === 0) {
      console.log(chalk.green('\n✨ No issues found! Great code quality!\n'));
      return;
    }
    
    console.log(chalk.bold('\n🔍 Detailed Issues:\n'));
    
    issues.forEach((issue, idx) => {
      const color = colors[issue.severity];
      console.log(chalk[color](`${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`));
      console.log(chalk.gray(`   Line ${issue.line}`));
      console.log(`   ${issue.description}`);
      
      if (issue.suggestion) {
        console.log(chalk.green(`   💡 Suggestion: ${issue.suggestion}`));
      }
      console.log();
    });
    
    // Recommendations
    console.log(chalk.bold.cyan('📝 Recommendations:\n'));
    
    const criticalCount = summary.critical || 0;
    const highCount = summary.high || 0;
    
    if (criticalCount > 0) {
      console.log(chalk.red(`  ⚠️  Fix ${criticalCount} critical issue(s) immediately`));
    }
    if (highCount > 0) {
      console.log(chalk.yellow(`  ⚠️  Address ${highCount} high priority issue(s) before merging`));
    }
    
    console.log(chalk.gray('\n  Run full scan: npm run review -- --all'));
    console.log(chalk.gray('  View dashboard: npm run dashboard\n'));
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('⚠️  VoiceAssistant.jsx not found'));
      console.log(chalk.gray('Run this from the ai-code-reviewer directory\n'));
    } else if (error.message.includes('API key')) {
      console.log(chalk.red('❌ API key not configured'));
      console.log(chalk.yellow('\nPlease add ANTHROPIC_API_KEY to .env file'));
      console.log(chalk.gray('Get your key from: https://console.anthropic.com/\n'));
    } else {
      console.error(chalk.red('Error:'), error.message);
    }
  }
}

testVoiceAssistant();

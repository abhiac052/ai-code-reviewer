#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { CodeReviewer } from './index.js';
import { watchMode } from './utils/watcher.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const program = new Command();

program
  .name('ai-review')
  .description('AI-powered code review assistant for Motilal Oswal AMC')
  .version('1.0.0');

program
  .command('review')
  .description('Review code changes')
  .option('-f, --files <files...>', 'Specific files to review')
  .option('-d, --diff', 'Review only git diff (staged changes)', false)
  .option('-a, --all', 'Review entire codebase', false)
  .option('--flows', 'Analyze user journeys and flows', false)
  .option('--security', 'Focus on security issues', false)
  .option('--performance', 'Focus on performance issues', false)
  .option('--financial', 'Focus on financial domain rules', false)
  .action(async (options) => {
    const spinner = ora('Initializing AI Code Reviewer...').start();
    
    try {
      const reviewer = new CodeReviewer({
        focusAreas: {
          security: options.security,
          performance: options.performance,
          financial: options.financial
        }
      });

      spinner.text = 'Analyzing code...';
      
      const results = await reviewer.review({
        files: options.files,
        diffOnly: options.diff,
        fullScan: options.all,
        analyzeFlows: options.flows
      });

      spinner.succeed('Code review completed!');
      
      displayResults(results);
      
      // Send results to dashboard
      try {
        await fetch('http://localhost:3001/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(results)
        }).catch(() => {}); // Ignore if dashboard not running
      } catch (e) {}
      
      if (results.summary.critical > 0) {
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Review failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch for file changes and review automatically')
  .action(async () => {
    console.log(chalk.blue('👀 Watching for file changes...\n'));
    await watchMode();
  });

program
  .command('dashboard')
  .description('Start web dashboard')
  .action(async () => {
    console.log(chalk.blue('🚀 Starting dashboard...\n'));
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const dashboardPath = join(__dirname, 'dashboard', 'server.js');
    
    const child = spawn('node', [dashboardPath], { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code));
  });

program.parse();

function displayResults(results) {
  console.log('\n' + chalk.bold('📊 Review Summary\n'));
  
  const severityColors = {
    critical: 'red',
    high: 'yellow',
    medium: 'blue',
    low: 'gray'
  };

  Object.entries(results.summary).forEach(([severity, count]) => {
    if (count > 0) {
      console.log(chalk[severityColors[severity]](`  ${severity.toUpperCase()}: ${count}`));
    }
  });

  console.log('\n' + chalk.bold('🔍 Issues Found:\n'));
  
  results.issues.forEach((issue, idx) => {
    const color = severityColors[issue.severity];
    console.log(chalk[color](`${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`));
    console.log(chalk.gray(`   File: ${issue.file}:${issue.line}`));
    console.log(`   ${issue.description}\n`);
    
    if (issue.suggestion) {
      console.log(chalk.green(`   💡 Suggestion: ${issue.suggestion}\n`));
    }
  });

  console.log(chalk.cyan(`\n📈 View detailed report: npm run dashboard\n`));
}

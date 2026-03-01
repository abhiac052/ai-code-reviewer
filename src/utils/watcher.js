import chokidar from 'chokidar';
import chalk from 'chalk';
import { CodeReviewer } from '../index.js';

export async function watchMode() {
  const reviewer = new CodeReviewer();
  
  const watcher = chokidar.watch('src/**/*.{js,jsx,ts,tsx}', {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('change', async (path) => {
      console.log(chalk.blue(`\n📝 File changed: ${path}`));
      console.log(chalk.gray('Running review...\n'));
      
      try {
        const results = await reviewer.review({ files: [path] });
        
        if (results.issues.length === 0) {
          console.log(chalk.green('✓ No issues found!\n'));
        } else {
          displayIssues(results.issues);
        }
      } catch (error) {
        console.error(chalk.red(`Error reviewing ${path}:`, error.message));
      }
    })
    .on('error', error => console.error(chalk.red('Watcher error:', error)));

  console.log(chalk.green('✓ Watching for changes... (Press Ctrl+C to stop)\n'));
}

function displayIssues(issues) {
  const colors = { critical: 'red', high: 'yellow', medium: 'blue', low: 'gray' };
  
  issues.forEach((issue, idx) => {
    console.log(chalk[colors[issue.severity]](`${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`));
    console.log(chalk.gray(`   Line ${issue.line}: ${issue.description}`));
    if (issue.suggestion) {
      console.log(chalk.green(`   💡 ${issue.suggestion}`));
    }
    console.log();
  });
}

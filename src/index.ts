import { Command } from 'commander';
import chalk from 'chalk';
import { logger, WELCOME_MESSAGE, SUBTITLE, TIP_MESSAGE } from './utils/logger';
import { testCommand } from './commands/test';

const program = new Command();

logger.title(WELCOME_MESSAGE);
logger.info(SUBTITLE);

program
  .version('1.0.0')
  .description(chalk.yellow('PostBoy CLI - Test your APIs with ease'));

program
  .command('test')
  .description('Run a test API request')
  .action(testCommand);

if (!process.argv.slice(2).length) {
  logger.warning(TIP_MESSAGE);
}

program.parse(process.argv);

#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import { logger, WELCOME_MESSAGE, SUBTITLE, TIP_MESSAGE } from './utils/logger';
import { uiCommand } from './commands/ui.js';
import { testCommand } from './commands/test';
import { mockApis } from './commands/mock';


const program = new Command();



program
	.version('1.0.0')
	.description(chalk.yellow('PostBoy CLI - Test your APIs with ease'))


program
	.command('run')
	.description('Run a test API request')
	.action(testCommand);

program
	.command('mock-list')
	.description('List the mock API servers')
	.action(mockApis)

program
	.command('ui')
	.description('UI for PostBoy')
	.action(uiCommand)


if (!process.argv.slice(2).length) {
	logger.warning(TIP_MESSAGE);
}

program.parse(process.argv);

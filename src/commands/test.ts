import inquirer from 'inquirer';
import chalk from 'chalk';
import { type RequestConfig } from '../types';
import { logger } from '../utils/logger';

export async function testCommand(): Promise<void> {
	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'url',
			message: chalk.green('Enter the API URL:'),
			default: 'https://api.example.com'
		},
		{
			type: 'list',
			name: 'method',
			message: chalk.green('Select HTTP method:'),
			choices: ['GET', 'POST', 'PUT', 'DELETE']
		}
	]) as RequestConfig;

	logger.info('\nYour request configuration:');
	logger.info(`URL: ${answers.url}`);
	logger.info(`Method: ${answers.method}`);

	try {
		const response = await fetch(answers.url, { method: answers.method });
		logger.success('\nResponse received! ✨');
		logger.info(`Status: ${response.status}`);
	} catch (error) {
		logger.error('\nError occurred! ❌');
		console.error(error);
	}
}

import inquirer from 'inquirer';
import chalk from 'chalk';
import { type RequestConfig } from '../types';
import { logger, SUBTITLE, WELCOME_MESSAGE } from '../utils/logger';

export async function testCommand(): Promise<void> {
	logger.title(WELCOME_MESSAGE);
	logger.info(SUBTITLE);
	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'url',
			message: chalk.green('Enter the API URL:'),
			default: 'leave this empty for selecting mock URL',
		},
		{
			type: 'list',
			name: 'MOCK_URL',
			message: chalk.green('Select a mock URL:'),
			choices: [
				'https://jsonplaceholder.typicode.com/posts', 'https://jsonplaceholder.typicode.com/comments', 'no thanks, I entered my own URL',
			],
			default: ''
		},
		{
			type: 'list',
			name: 'method',
			message: chalk.green('Select HTTP method:'),
			choices: ['GET', 'POST', 'PUT', 'DELETE']
		},
		{
			type: 'input',
			name: 'headers',
			message: chalk.green('Enter headers (JSON format):'),
			default: '{}'
		},
		{
			type: 'input',
			name: 'body',
			message: chalk.green('Enter request body (JSON format):'),
			default: '{}'
		}
	]) as RequestConfig;

	logger.info('\nYour request configuration:');
	logger.info(`URL: ${answers.url.split("https://") || answers.MOCK_URL}`);
	logger.info(`Method: ${answers.method}`);

	try {
		const response = await fetch(answers.url.includes("http") ? answers.url : answers.MOCK_URL ?? "", { method: answers.method });
		logger.success('\nResponse received! ✨');
		logger.info(`Status: ${response.status}`);
		logger.info(`Status Text: ${response.statusText}`);
		console.log(chalk.green('Response Body :'));
		+ logger.info(await response.text());

		console.log(chalk.green('Response Headers:'));
		logger.info(JSON.stringify(response.headers, null, 2));
	} catch (err) {
		logger.error('\nError occurred! ❌');
		console.error(chalk.magentaBright(err));
	}
}

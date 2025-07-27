import inquirer from 'inquirer';
import chalk from 'chalk';
import { type RequestConfig } from '../types';
import { logger } from '../utils/logger';
import { historyManager } from '../utils/history';

export async function testCommand(): Promise<void> {
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
	
	// Determine the actual URL to use
	const actualUrl = answers.url.includes("http") ? answers.url : answers.MOCK_URL ?? "";
	logger.info(`URL: ${actualUrl}`);
	logger.info(`Method: ${answers.method}`);
	const startTime = Date.now();

	try {
		const response = await fetch(actualUrl, { method: answers.method });
		const responseTime = Date.now() - startTime;

		logger.success('\nResponse received! ✨');
		logger.info(`Status: ${response.status}`);
		logger.info(`Status Text: ${response.statusText}`);
		console.log(chalk.green('Response Body :'));
		logger.info(await response.text());

		console.log(chalk.green('Response Headers:'));
		logger.info(JSON.stringify(response.headers, null, 2));

		// Save the request with the correct URL
		const requestToSave = {
			...answers,
			url: actualUrl,  // Override with the actual URL used
			MOCK_URL: answers.MOCK_URL ?? ""  // Keep the original selection
		};

		await historyManager.addEntry(requestToSave, response.status, responseTime);
		logger.info(`\nRequest saved to history (${responseTime}ms)`);
	} catch (err) {
		const responseTime = Date.now() - startTime;
		
		logger.error('\nError occurred! ❌');
		console.error(chalk.magentaBright(err));

		await historyManager.addEntry(answers, undefined, responseTime);
    	logger.info(`\n📝 Failed request saved to history (${responseTime}ms)`);
	}
}

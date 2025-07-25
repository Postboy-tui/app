import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';

const program = new Command();

console.log(chalk.blue.bold('\n🚀 Welcome to PostBoy CLI! 📬\n'));
console.log(chalk.cyan('Your Ultimate API Testing Companion powered by Bun\n'));

program
	.version('1.0.0')
	.description(chalk.yellow('PostBoy CLI - Test your APIs with ease'));

// Add some sample command
program
	.command('test')
	.description('Run a test API request')
	.action(async () => {
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
		]);

		console.log(chalk.cyan('\nYour request configuration:'));
		console.log(chalk.white(`URL: ${answers.url}`));
		console.log(chalk.white(`Method: ${answers.method}`));

		try {
			const response = await fetch(answers.url, { method: answers.method });
			console.log(chalk.green('\nResponse received! ✨'));
			console.log(chalk.white(`Status: ${response.status}`));
			console.log(chalk.blueBright(`Headers : ${response.headers.get('content-type')}`));
			console.log(chalk.cyan(`Body: ${await response.body?.text()}`));


		} catch (error) {
			console.log(chalk.red('\nError occurred! ❌'));
			console.error(error);
		}
	});

if (!process.argv.slice(2).length) {
	console.log(chalk.yellow('\nTip: Try running "bun run index.ts test" to start testing APIs!\n'));
}

program.parse(process.argv);

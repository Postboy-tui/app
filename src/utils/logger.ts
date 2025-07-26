import chalk from 'chalk';

export const logger = {
	info: (message: string) => console.log(chalk.blueBright(message)),
	success: (message: string) => console.log(chalk.green(message)),
	error: (message: string) => console.log(chalk.red(message)),
	warning: (message: string) => console.log(chalk.yellow(message)),
	title: (message: string) => console.log(chalk.blue.bold(message))
};

export const WELCOME_MESSAGE = '\n🚀 Welcome to PostBoy CLI! 📬\n';
export const SUBTITLE = 'Your Ultimate API Testing Companion powered by Bun\n';
export const TIP_MESSAGE = '\nTip: Try running "bun run index.ts test" to start testing APIs!\n';

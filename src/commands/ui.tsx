import { render, Box, Text, useApp, useInput } from 'ink';
import App from '../ui/app/app';
import chalk from 'chalk';

const UIWrapper = () => {
	const { exit } = useApp();
	useInput((input) => {
		if (input === 'q') {
			exit();
		}
	});

	return (
		<Box flexDirection="column">
			<Text>{chalk.cyanBright(`PostBoy 💌`)}</Text>
			<App />
		</Box>
	);
};

export const uiCommand = () => {
	render(<UIWrapper />);
};

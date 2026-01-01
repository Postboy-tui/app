import { render, Box, Text } from 'ink';
import App from '../ui/app/app';
import chalk from 'chalk';

const UIWrapper = () => {
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

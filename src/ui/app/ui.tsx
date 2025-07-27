import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';
import chalk from 'chalk';

// --- THEME ---
const theme = {
	background: '#0d0d0d',
	primary: 'cyan',
	secondary: 'magenta',
	accent: 'yellow',
	success: 'green',
	error: 'red',
	muted: 'gray',
	white: '#ffffff',
};

const Spinner = () => {
	const [frame, setFrame] = useState(0);
	const frames = ['▖', '▘', '▝', '▗'];

	useEffect(() => {
		const interval = setInterval(() => {
			setFrame(frame => (frame + 1) % frames.length);
		}, 100);
		return () => clearInterval(interval);
	}, []);

	return <Text color={theme.primary}>{frames[frame]}</Text>;
};

const FormField: React.FC<{
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
	const { isFocused } = useFocus();

	useInput(
		(input, key) => {
			// This handler is only active when the component is focused.
			// We ignore navigation keys, so Ink's focus manager can handle them.
			if (
				key.upArrow ||
				key.downArrow ||
				key.leftArrow ||
				key.rightArrow ||
				key.return ||
				key.tab
			) {
				return;
			}

			if (key.backspace || key.delete) {
				onChange(value.slice(0, -1));
				return;
			}

			// Handle printable character input
			onChange(value + input);
		},
		{ isActive: isFocused },
	);

	return (
		<Box>
			<Box width={10}>
				<Text color={theme.muted}>{label}: </Text>
			</Box>
			<Box
				borderStyle="round"
				borderColor={isFocused ? theme.primary : theme.muted}
				paddingX={1}
				flexGrow={1}
			>
				<Text color={isFocused ? theme.primary : theme.white}>
					{value || placeholder}
				</Text>
			</Box>
		</Box>
	);
};

interface Tab {
	name: string;
	label: string;
}

interface TabsProps {
	tabs: Tab[];
	activeTab: string;
	onChange: (name: string) => void;
}

const TabItem: React.FC<{
	name: string;
	label: string;
	isActive: boolean;
	onChange: (name: string) => void;
}> = ({ name, label, isActive, onChange }) => {
	const { isFocused } = useFocus();
	useInput((_input, key) => {
		if (isFocused && key.return) {
			onChange(name);
		}
	});

	return (
		<Box
			borderStyle={isActive ? 'double' : 'single'}
			borderColor={isFocused ? theme.accent : theme.primary}
			paddingX={2}
			marginRight={1}
		>
			<Text
				color={isActive ? theme.accent : theme.white}
				bold={isActive || isFocused}
			>
				{label}
			</Text>
		</Box>
	);
};

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
	<Box>
		{tabs.map(tab => (
			<TabItem
				key={tab.name}
				name={tab.name}
				label={tab.label}
				isActive={activeTab === tab.name}
				onChange={onChange}
			/>
		))}
	</Box>
);

interface Request {
	method: string;
	url: string;
	headers: string;
	body: string;
}

const HistoryItem: React.FC<{
	item: Request;
	onClick: (item: Request) => void;
}> = ({ item, onClick }) => {
	const { isFocused } = useFocus();
	useInput((_input, key) => {
		if (isFocused && key.return) {
			onClick(item);
		}
	});

	return (
		<Box paddingX={1} borderColor={isFocused ? theme.accent : theme.background}>
			<Text color={isFocused ? theme.accent : theme.primary}>&gt; </Text>
			<Text color={isFocused ? theme.white : theme.muted}>
				{item.method} {item.url}
			</Text>
		</Box>
	);
};

const SendButton: React.FC<{ onPress: () => void; loading: boolean }> = ({
	onPress,
	loading,
}) => {
	const { isFocused } = useFocus();
	useInput((_input, key) => {
		if (isFocused && key.return) {
			onPress();
		}
	});

	return (
		<Box
			borderStyle="double"
			paddingX={4}
			borderColor={isFocused ? theme.accent : theme.primary}
		>
			{loading ? (
				<Spinner />
			) : (
				<Text bold color={isFocused ? theme.accent : theme.white}>
					SEND
				</Text>
			)}
		</Box>
	);
};

const getStatusColor = (status: string) => {
	if (status.startsWith('2')) return theme.success;
	if (status.startsWith('4')) return theme.error;
	if (status.startsWith('5')) return theme.error;
	return theme.accent;
};

const UI = () => {
	const [activeTab, setActiveTab] = useState('request');
	const [request, setRequest] = useState<Request>({
		method: 'GET',
		url: '',
		headers: '',
		body: '',
	});
	const [response, setResponse] = useState({
		status: '',
		headers: '',
		body: '',
	});
	const [history, setHistory] = useState<Request[]>([]);
	const [loading, setLoading] = useState(false);

	const handleTabChange = (name: string) => {
		setActiveTab(name);
	};

	const handleSend = () => {
		setLoading(true);
		const newHistory = [request, ...history];
		setHistory(newHistory);

		// Mock API call
		setTimeout(() => {
			setResponse({
				status: '200 OK',
				headers: 'Content-Type: application/json',
				body: JSON.stringify({ message: 'Success!', from: request.url }),
			});
			setActiveTab('response');
			setLoading(false);
		}, 1000);
	};

	const handleHistoryClick = (item: Request) => {
		setRequest(item);
		setActiveTab('request');
	};

	const tabs = [
		{ name: 'request', label: 'Request' },
		{ name: 'response', label: 'Response' },
	];

	return (
		<Box
			borderStyle="double"
			padding={1}
			flexDirection="column"
			borderColor={theme.primary}
		>
			<Box>
				<Box
					width="30%"
					borderStyle="single"
					borderColor={theme.muted}
					padding={1}
					flexDirection="column"
				>
					<Text color={theme.secondary} bold>
						{chalk.green('H I S T O R Y')}
					</Text>

					{
						history.map((item, index) => (
							<HistoryItem key={item.url} item={item} onClick={handleHistoryClick} />
						))
					}
				</Box>
				<Box
					width="70%"
					borderStyle="single"
					borderColor={theme.muted}
					padding={1}
					flexDirection="column"
				>
					<Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
					<Box marginTop={1} flexDirection="column">
						{activeTab === 'request' && (
							<Box flexDirection="column" gap={1}>
								<FormField
									label="METHOD"
									value={request.method}
									onChange={(method: string) =>
										setRequest({ ...request, method })
									}
									placeholder="GET"
								/>
								<FormField
									label="URL"
									value={request.url}
									onChange={(url: string) => setRequest({ ...request, url })}
									placeholder="https://api.bebop.net/data"
								/>
								<FormField
									label="HEADERS"
									value={request.headers}
									onChange={(headers: string) =>
										setRequest({ ...request, headers })
									}
									placeholder="Content-Type: application/json"
								/>
								<FormField
									label="BODY"
									value={request.body}
									onChange={(body: string) => setRequest({ ...request, body })}
									placeholder='{ "bounty": "true" }'
								/>
								<Box marginTop={1} alignItems="center" justifyContent="center">
									<SendButton onPress={handleSend} loading={loading} />
								</Box>
							</Box>
						)}
						{activeTab === 'response' && (
							<Box flexDirection="column" gap={1}>
								<Text color={getStatusColor(response.status)} bold>
									STATUS: {response.status}
								</Text>
								<Text color={theme.primary}>HEADERS:</Text>
								<Text>{response.headers}</Text>
								<Text color={theme.primary}>BODY:</Text>
								<Text>{response.body}</Text>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default UI;

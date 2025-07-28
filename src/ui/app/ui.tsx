import React, { useState, useEffect, type ReactNode } from 'react';
import { Box, Text, useInput, useFocus, useStdout } from 'ink';
import { useRef, useLayoutEffect } from 'react';
import chalk from 'chalk';
import { historyManager } from '../../utils/history';
import { type RequestConfig } from '../../types';

type HistoryEntry = RequestConfig & {
	timestamp?: number;
	responseStatus?: number;
	responseTime?: number;
};

// --- THEME ---
const ScrollableBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { stdout } = useStdout();
	const [scrollPosition, setScrollPosition] = useState(0);
	const maxHeight = stdout.rows - 6;
	const [contentHeight, setContentHeight] = useState(0);

	useInput((input, key) => {
		if (key.pageUp) {
			setScrollPosition(prev => Math.max(0, prev - maxHeight));
		}
		if (key.pageDown) {
			setScrollPosition(prev => Math.min(contentHeight - maxHeight, prev + maxHeight));
		}
	});

	useEffect(() => {
		const estimateHeight = (node: React.ReactNode): number => {
			if (!node) return 0;
			if (typeof node === 'string') return node.split('\n').length;
			if (Array.isArray(node)) return node.reduce((acc, child) => acc + estimateHeight(child), 0);
			if (React.isValidElement(node)) {
				return estimateHeight(node.props as ReactNode)
			}
			return 1;
		};

		setContentHeight(estimateHeight(children));
	}, [children]);

	const visibleContent = React.Children.map(children, child => {
		if (!React.isValidElement(child)) return child;
		return React.cloneElement(child as React.ReactElement<any>);
	});

	return (
		<Box flexDirection="column" height={maxHeight}>
			<Box height={maxHeight - 1} flexDirection="column">
				<Box marginTop={-scrollPosition} flexDirection="column">
					{visibleContent}
				</Box>
			</Box>
			<Box>
				<Text color="gray">
					{contentHeight > maxHeight ?
						`[SCROLL (↑/↓)] ${scrollPosition + 1}-${Math.min(scrollPosition + maxHeight, contentHeight)}/${contentHeight}`
						: ''}
				</Text>
			</Box>
		</Box>
	);
};

const theme = {
	background: '#1a1b26',
	primary: '#7aa2f7',
	secondary: '#bb9af7',
	accent: '#ff9e64',
	success: '#9ece6a',
	error: '#f7768e',
	muted: '#565f7d',
	white: '#c0caf5',
};

const Spinner = () => {
	const [frame, setFrame] = useState(0);
	const frames = ['▖', '▘', '▝', '▗'];

	useEffect(() => {
		const interval = setInterval(() => {
			setFrame(frame => (frame + 1) % frames.length);
		}, 80);
		return () => clearInterval(interval);
	}, []);

	return <Text color={theme.accent}>{frames[frame]}</Text>;
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

			onChange(value + input);
		},
		{ isActive: isFocused },
	);

	return (
		<Box>
			<Box width={10}>
				<Text color={isFocused ? theme.accent : theme.muted}>{label}: </Text>
			</Box>
			<Box
				borderStyle="round"
				borderColor={isFocused ? theme.primary : theme.muted}
				paddingX={1}
				flexGrow={1}
			>
				<Text color={isFocused ? theme.white : theme.primary}>
					{value || <Text color={theme.muted}>{placeholder}</Text>}
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
	onChange: (name:string) => void;
}> = ({ name, label, isActive, onChange }) => {
	const { isFocused } = useFocus();
	useInput((_input, key) => {
		if (isFocused && key.return) {
			onChange(name);
		}
	});

	return (
		<Box
			borderStyle="round"
			borderColor={isActive ? theme.accent : (isFocused ? theme.primary : 'transparent')}
			paddingX={2}
			marginRight={1}
		>
			<Text
				color={isActive ? theme.accent : (isFocused ? theme.primary : theme.white)}
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
	method: "GET" | "POST" | "PUT" | "DELETE";
	url: string;
	headers: string;
	body: string;
}

const HistoryItem: React.FC<{
	item: HistoryEntry;
	onClick: (item: HistoryEntry) => void;
}> = ({ item, onClick }) => {
	const { isFocused } = useFocus();
	useInput((_input, key) => {
		if (isFocused && key.return) {
			onClick(item);
		}
	});

	const shortenUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			const pathParts = urlObj.pathname.split('/');
			const domain = urlObj.hostname.replace('www.', '');
			const shortPath = pathParts.length > 2 ?
				`/${pathParts[1]}/.../${pathParts[pathParts.length - 1]}` :
				urlObj.pathname;
			const query = urlObj.search ? `?${urlObj.search.slice(1, 15)}${urlObj.search.length > 15 ? '...' : ''}` : '';
			return `${domain}${shortPath}${query}`;
		} catch {
			return url.length > 30 ? url.slice(0, 27) + '...' : url;
		}
	};

	const statusColor = item.responseStatus ? getStatusColor(item.responseStatus.toString()) : theme.muted;

	return (
		<Box
			paddingX={1}
			borderStyle="round"
			borderColor={isFocused ? theme.accent : 'transparent'}
		>
			<Box flexDirection="column">
				<Box flexDirection="row">
					<Box marginRight={1} width={5}>
						<Text color={statusColor} bold={isFocused}>
							{String(item.responseStatus || '---').padStart(3, ' ')}
						</Text>
					</Box>
					<Box width={7}>
						<Text color={isFocused ? theme.accent : theme.primary} bold={isFocused}>
							{item.method.padEnd(7)}
						</Text>
					</Box>
					<Box flexGrow={1}>
						<Text color={isFocused ? theme.white : theme.muted}>
							{shortenUrl(item.url)}
						</Text>
					</Box>
				</Box>
				<Box paddingLeft={13}>
					<Text color={theme.muted} dimColor={!isFocused}>
						{item.responseTime ? `${Math.round(item.responseTime)}ms ` : ''}
						{item.timestamp ? new Date(item.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : ''}
					</Text>
				</Box>
			</Box>
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
			borderStyle="round"
			paddingX={4}
			borderColor={isFocused ? theme.accent : theme.primary}
		>
			{loading ? (
				<Spinner />
			) : (
				<Text bold color={isFocused ? theme.accent : theme.white}>
					🚀 SEND
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
		statustext: '',
		status: '',
		headers: '',
		body: '',
		error: ''
	});
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const loadHistory = async () => {
			const historyData = await historyManager.loadHistory();
			setHistory(historyData.entries);
		};
		loadHistory();
	}, []);

	const handleTabChange = (name: string) => {
		setActiveTab(name);
	};

	const handleSend = async () => {
		setLoading(true);
		const startTime = Date.now();

		try {
			let parsedHeaders: Record<string, string> = {};
			let parsedBody: any;

			try {
				if (request.headers) {
					parsedHeaders = JSON.parse(request.headers);
				}
				if (request.body) {
					parsedBody = JSON.parse(request.body);
				}
			} catch (e: any) {
				setResponse({
					status: 'Error',
					statustext: 'Invalid JSON',
					headers: '{}',
					body: e.message,
					error: e.message,
				});
				setActiveTab('response');
				setLoading(false);
				return;
			}

			const res = await fetch(request.url, {
				method: request.method,
				headers: parsedHeaders,
				body: parsedBody ? JSON.stringify(parsedBody) : undefined
			});

			const responseTime = Date.now() - startTime;
			const responseBody = await res.text();
			const responseHeaders = Object.fromEntries(res.headers.entries());

			await historyManager.addEntry(
				{
					method: request.method as RequestConfig['method'],
					url: request.url,
					headers: request.headers || '',
					body: request.body || ''
				},
				res.status,
				responseTime
			);

			const updatedHistory = await historyManager.loadHistory();
			setHistory(updatedHistory.entries);

			setResponse({
				statustext: res.statusText,
				status: res.status.toString(),
				headers: JSON.stringify(responseHeaders),
				body: responseBody,
				error: res.ok ? '' : `Error: ${res.statusText}`
			});
			setActiveTab('response');
		} catch (error: any) {
			setResponse({
				status: 'Error',
				statustext: 'Request Failed',
				headers: '{}',
				body: error.message,
				error: error.message,
			});
			setActiveTab('response');
		} finally {
			setLoading(false);
		}
	};

	const handleHistoryClick = (item: HistoryEntry) => {
		setRequest({
			method: item.method as Request['method'],
			url: item.url,
			headers: typeof item.headers === 'object' ? JSON.stringify(item.headers, null, 2) : item.headers || '',
			body: typeof item.body === 'object' ? JSON.stringify(item.body, null, 2) : item.body || ''
		});
		setActiveTab('request');
	};

	const tabs = [
		{ name: 'request', label: 'Request' },
		{ name: 'response', label: 'Response' },
	];

	return (
		<Box
			borderStyle="round"
			padding={1}
			flexDirection="column"
			borderColor={theme.secondary}
		>
			<Box>
				<Box
					width="35%"
					borderStyle="round"
					borderColor={theme.muted}
					flexDirection="column"
					marginRight={1}
				>
					<Box borderStyle="round" borderColor={theme.secondary} paddingX={2} marginBottom={1} alignSelf="center">
						<Text color={theme.accent} bold>
							📜 History
						</Text>
					</Box>
					<Box flexDirection="column">
						{history.length === 0 ? (
							<Box padding={1}>
								<Text color={theme.muted}>No requests yet...</Text>
							</Box>
						) : (
							<ScrollableBox>
								{history.map((item, index) => (
									<Box key={item.timestamp} flexDirection="column">
										<HistoryItem item={item} onClick={handleHistoryClick} />
										{index < history.length - 1 && (
											<Box paddingX={1}>
												<Text key={`divider-${item.timestamp}`} color={theme.muted}>
													─
												</Text>
											</Box>
										)}
									</Box>
								))}
							</ScrollableBox>
						)}
					</Box>
				</Box>
				<Box
					width="65%"
					borderStyle="round"
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
										setRequest({
											...request,
											method: method as Request['method']
										})
									}
									placeholder="GET"
								/>
								<FormField
									label="URL"
									value={request.url}
									onChange={(url: string) => setRequest({ ...request, url })}
									placeholder="https://api.example.com"
								/>
								<FormField
									label="HEADERS"
									value={request.headers}
									onChange={(headers: string) =>
										setRequest({ ...request, headers })
									}
									placeholder='{ "Authorization": "Bearer ..." }'
								/>
								<FormField
									label="BODY"
									value={request.body}
									onChange={(body: string) => setRequest({ ...request, body })}
									placeholder='{ "key": "value" }'
								/>
								<Box marginTop={1} alignItems="center" justifyContent="center">
									<SendButton onPress={handleSend} loading={loading} />
								</Box>
							</Box>
						)}
						{activeTab === 'response' && (
							<ScrollableBox>
								<Box flexDirection="column" gap={1}>
									<Box>
										<Box width={10}>
											<Text color={theme.primary}>STATUS:</Text>
										</Box>
										<Text color={getStatusColor(response.status)} bold>
											{response.status + ' ' + response.statustext}
										</Text>
									</Box>

									<Box>
										<Box width={10}>
											<Text color={theme.primary}>HEADERS:</Text>
										</Box>
										<Box flexDirection="column" paddingLeft={2}>
											{Object.entries(JSON.parse(response.headers || '{}')).map(([key, value]) => (
												<Text key={key}>
													<Text color={theme.accent}>{key}</Text>
													<Text color={theme.muted}>: </Text>
													<Text color={theme.success}>{String(value)}</Text>
												</Text>
											))}
										</Box>
									</Box>

									<Box>
										<Box width={10}>
											<Text color={theme.primary}>PAYLOAD:</Text>
										</Box>
										<Box flexDirection="column" paddingLeft={2}>
											{response.body.startsWith('{') || response.body.startsWith('[') ? (
												<>
													{JSON.stringify(JSON.parse(response.body || '{}'), null, 2)
														.split('\n')
														.map((line, i) => {
															const indent = line.match(/^\s*/)?.[0] || '';
															const parts = line.trim().match(/^("([^"]+)":|[{}\[\],]|.+)?$/);

															return (
																<Text key={i}>
																	<Text>{indent}</Text>
																	{parts && parts[1] && (
																		<>
																			{line.includes('"') && line.includes(':') ? (
																				<>
																					<Text color={theme.secondary}>{line.split(':')[0].trim()}</Text>
																					<Text color={theme.muted}>: </Text>
																					<Text color={theme.white}>
																						{line.split(':')[1].trim().replace(/,$/, '')}
																					</Text>
																					<Text color={theme.muted}>
																						{line.trim().endsWith(',') ? ',' : ''}
																					</Text>
																				</>
																			) : (
																				<Text color={line.trim().match(/^[{}\[\],]$/) ? theme.muted : theme.success}>
																					{line.trim()}
																				</Text>
																			)}
																		</>
																	)}
																</Text>
															);
														})}
												</>
											) : (
												<Text color={theme.success}>{response.body !== '{}' ? response.body : response.error}</Text>
											)}
										</Box>
									</Box>
								</Box>
							</ScrollableBox>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default UI;

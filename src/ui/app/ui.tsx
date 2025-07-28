import React, { useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import { Box, Text, useInput, useFocus, useStdout, useApp, useFocusManager } from 'ink';
import { historyManager } from '../../utils/history';
import { sendRequest } from '../../utils/request';
import { type RequestConfig } from '../../types';
import { themes } from './themes';

type ThemeColors = typeof themes[keyof typeof themes]['colors'];

type HistoryEntry = RequestConfig & {
	timestamp?: number;
	responseStatus?: number;
	responseTime?: number;
};

const ScrollableBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { stdout } = useStdout();
	const [scrollPosition, setScrollPosition] = useState(0);
	const maxHeight = stdout.rows - 4;
	const [contentHeight, setContentHeight] = useState(0);

	useInput((_, key) => {
		if (key.pageUp) setScrollPosition(prev => Math.max(0, prev - maxHeight));
		if (key.pageDown) setScrollPosition(prev => Math.min(contentHeight - maxHeight, prev + maxHeight));
	});

	useEffect(() => {
		const estimateHeight = (node: React.ReactNode): number => {
			if (!node) return 0;
			if (typeof node === 'string') return node.split('\n').length;
			if (Array.isArray(node)) return node.reduce((acc, child) => acc + estimateHeight(child), 0);
			if (React.isValidElement(node)) return estimateHeight((node.props as { children?: ReactNode }).children);
			return 1;
		};
		setContentHeight(estimateHeight(children));
	}, [children]);

	return (
		<Box flexDirection="column" height={maxHeight} flexGrow={1}>
			<Box flexGrow={1} flexDirection="column">
				<Box marginTop={-scrollPosition} flexDirection="column">
					{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>) : child)}
				</Box>
			</Box>
			{contentHeight > maxHeight && (
				<Box justifyContent="center">
					<Text color="gray">{`Scroll (PgUp/PgDn) ${scrollPosition + 1}-${Math.min(scrollPosition + maxHeight, contentHeight)}/${contentHeight}`}</Text>
				</Box>
			)}
		</Box>
	);
};

const Spinner: React.FC<{ theme: ThemeColors }> = ({ theme }) => {
	const [frame, setFrame] = useState(0);
	const frames = ['▖', '▘', '▝', '▗'];
	useEffect(() => {
		const interval = setInterval(() => setFrame(f => (f + 1) % frames.length), 80);
		return () => clearInterval(interval);
	}, []);
	return <Text color={theme.accent}>{frames[frame]}</Text>;
};

interface FormFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	theme: ThemeColors;
	suggestions?: string[];
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, placeholder, theme, suggestions = [] }) => {
	const { isFocused } = useFocus();
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
	const [highlightedIndex, setHighlightedIndex] = useState(0);

	useEffect(() => {
		if (isFocused && suggestions.length > 0 && value) {
			const filtered = suggestions.filter(s => s.toLowerCase().startsWith(value.toLowerCase()));
			setFilteredSuggestions(filtered);
			setShowSuggestions(filtered.length > 0);
			setHighlightedIndex(0);
		} else {
			setShowSuggestions(false);
		}
	}, [value, isFocused, suggestions]);

	useInput((input, key) => {
		if (!isFocused) return;
		if (showSuggestions && (key.upArrow || key.downArrow)) {
			setHighlightedIndex(idx => {
				if (key.upArrow) return idx > 0 ? idx - 1 : filteredSuggestions.length - 1;
				if (key.downArrow) return idx < filteredSuggestions.length - 1 ? idx + 1 : 0;
				return idx;
			});
			return;
		}
		if (showSuggestions && (key.return || key.tab)) {
			if (filteredSuggestions.length > 0 && typeof filteredSuggestions[highlightedIndex] === 'string') {
				onChange(filteredSuggestions[highlightedIndex]);
				setShowSuggestions(false);
			}
			return;
		}
		if (key.backspace || key.delete) {
			onChange(value.slice(0, -1));
			return;
		}
		if (!key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.return && !key.tab) {
			onChange(value + input);
		}
	}, { isActive: isFocused });

	return (
		<Box flexDirection="column">
			<Box>
				<Box width={8}><Text color={isFocused ? theme.accent : theme.muted}>{label}:</Text></Box><Box borderStyle="classic" borderColor={isFocused ? theme.primary : theme.muted} paddingX={1} flexGrow={1}>{value ? <Text color={isFocused ? theme.white : theme.primary}>{value}</Text> : <Text color={theme.muted}>{placeholder}</Text>}</Box></Box>{showSuggestions && (<Box flexDirection="column" marginLeft={8} borderStyle="classic" borderColor={theme.muted}>{filteredSuggestions.filter(s => typeof s === 'string' && s.trim().length > 0).map((s, idx) => (<Box key={s || idx} backgroundColor={idx === highlightedIndex ? theme.accent : undefined}><Text color={idx === highlightedIndex ? theme.white : theme.primary}>{typeof s === 'string' ? s : '[invalid]'}</Text></Box>))}</Box>)}
		</Box>
	);
};


interface Tab { name: string; label: string; }

interface TabsProps {
	tabs: Tab[];
	activeTab: string;
	onChange: (name: string) => void;
	theme: ThemeColors;
}

const TabItem: React.FC<{ name: string; label: string; isActive: boolean; onChange: (name: string) => void; theme: ThemeColors }> = ({ name, label, isActive, onChange, theme }) => {
	const { isFocused } = useFocus();
	useInput((_, key) => { if (isFocused && key.return) onChange(name); });
	return (
		<Box borderStyle="classic" borderTopColor={'grey'} borderColor={isActive ? theme.accent : (isFocused ? theme.primary : 'transparent')} paddingX={1} marginRight={1}>
			<Text color={isActive ? theme.accent : (isFocused ? theme.primary : theme.white)} bold={isActive || isFocused}>{label}</Text>
		</Box>
	);
};

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, theme }) => (
	<Box>{tabs.map(tab => <TabItem key={tab.name} {...tab} isActive={activeTab === tab.name} onChange={onChange} theme={theme} />)}</Box>
);

interface Request { method: "GET" | "POST" | "PUT" | "DELETE"; url: string; headers: string; body: string; }

const HistoryListItem: React.FC<{ item: HistoryEntry; isSelected: boolean; theme: ThemeColors }> = ({ item, isSelected, theme }) => {
	const shortenUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			const path = urlObj.pathname.length > 20 ? `${urlObj.pathname.slice(0, 17)}...` : urlObj.pathname;
			return `${urlObj.hostname}${path}`;
		} catch { return url.length > 30 ? `${url.slice(0, 27)}...` : url; }
	};
	const statusColor = item.responseStatus ? getStatusColor(item.responseStatus.toString(), theme) : theme.muted;
	return (
		<Box paddingX={1} borderColor={isSelected ? theme.accent : 'transparent'}>
			<Box flexDirection="column">
				<Box><Box marginRight={1} width={5}><Text color={statusColor} bold={isSelected}>{String(item.responseStatus || '---').padStart(3, ' ')}</Text></Box><Box width={7}><Text color={isSelected ? theme.accent : theme.primary} bold={isSelected}>{item.method.padEnd(7)}</Text></Box><Box flexGrow={1}><Text color={isSelected ? theme.white : theme.muted}>{shortenUrl(item.url)}</Text></Box></Box>
				<Box paddingLeft={13}><Text color={theme.muted} dimColor={!isSelected}>{item.responseTime ? `${Math.round(item.responseTime)}ms ` : ''}{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}</Text></Box>
			</Box>
		</Box>
	);
};

const HistoryList: React.FC<{ history: HistoryEntry[]; onItemClick: (item: HistoryEntry) => void; theme: ThemeColors }> = ({ history, onItemClick, theme }) => {
	const { stdout } = useStdout();
	const { isFocused } = useFocus();
	const { focusNext } = useFocusManager();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollPosition, setScrollPosition] = useState(0);
	const listRef = useRef(null);

	const maxHeight = stdout.rows - 8; // Adjusted for footer and other elements

	useInput((_, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		}
		if (key.downArrow) {
			setSelectedIndex(prev => Math.min(history.length - 1, prev + 1));
		}
		if (key.return && history[selectedIndex]) {
			onItemClick(history[selectedIndex]);
		}
		if (key.tab) {
			focusNext();
		}
		if (key.pageUp) {
			setScrollPosition(prev => Math.max(0, prev - maxHeight));
		}
		if (key.pageDown) {
			setScrollPosition(prev => Math.min(history.length - maxHeight, prev + maxHeight));
		}
	}, { isActive: isFocused });

	useEffect(() => {
		if (selectedIndex < scrollPosition) {
			setScrollPosition(selectedIndex);
		} else if (selectedIndex >= scrollPosition + maxHeight) {
			setScrollPosition(selectedIndex - maxHeight + 1);
		}
	}, [selectedIndex, maxHeight, scrollPosition]);

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box flexDirection="column" ref={listRef}>
				{history.slice(scrollPosition, scrollPosition + maxHeight).map((item, index) => (
					<HistoryListItem
						key={item.timestamp}
						item={item}
						isSelected={isFocused && selectedIndex === scrollPosition + index}
						theme={theme}
					/>
				))}
			</Box>
		</Box>
	);
};

const SendButton: React.FC<{ onPress: () => void; loading: boolean; theme: ThemeColors }> = ({ onPress, loading, theme }) => {
	const { isFocused } = useFocus();
	useInput((_, key) => { if (isFocused && key.return) onPress(); });
	return (
		<Box borderStyle="classic" paddingX={2} borderColor={isFocused ? theme.accent : theme.primary}>
			{loading ? <Spinner theme={theme} /> : <Text bold color={isFocused ? theme.accent : theme.white}>🚀 Send</Text>}
		</Box>
	);
};

const getStatusColor = (status: string, theme: ThemeColors) => {
	if (status.startsWith('2')) return theme.success;
	if (status.startsWith('4')) return theme.error;
	if (status.startsWith('5')) return theme.error;
	return theme.accent;
};

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];

const RequestPanel = React.memo<{
	request: Request;
	onMethodChange: (method: string) => void;
	onUrlChange: (url: string) => void;
	onHeadersChange: (headers: string) => void;
	onBodyChange: (body: string) => void;
	onSend: () => void;
	loading: boolean;
	theme: ThemeColors;
	historyUrls?: string[];
}>(({ request, onMethodChange, onUrlChange, onHeadersChange, onBodyChange, onSend, loading, theme, historyUrls = [] }) => (
	<Box flexDirection="column" gap={1} flexGrow={1}>
		<FormField label="Method" value={request.method} onChange={onMethodChange} placeholder="GET" theme={theme} suggestions={HTTP_METHODS} />
		<FormField label="URL" value={request.url} onChange={onUrlChange} placeholder="https://api.example.com" theme={theme} suggestions={historyUrls} />
		<FormField label="Headers" value={request.headers} onChange={onHeadersChange} placeholder='{ "key": "value" }' theme={theme} />
		<FormField label="Body" value={request.body} onChange={onBodyChange} placeholder='{ "key": "value" }' theme={theme} />
		<Box marginTop={1} justifyContent="center"><SendButton onPress={onSend} loading={loading} theme={theme} /></Box>
	</Box>
));


const JsonSyntaxHighlight = React.memo<{ jsonString: string; theme: ThemeColors }>(({ jsonString, theme }) => {
	try {
		const json = JSON.parse(jsonString);
		const prettyJson = JSON.stringify(json, null, 2);

		return (
			<Box flexDirection="column">
				{prettyJson.split('\n').map((line, i) => {
					const indent = line.match(/^\s*/)?.[0] || '';
					const trimmedLine = line.trim();
					const keyMatch = trimmedLine.match(/^"([^"]+)"\s*:\s*(.*)/);

					if (keyMatch) {
						const key = keyMatch[1] || '';
						const valueString = (keyMatch[2] || '').replace(/,$/, '');
						const hasComma = (keyMatch[2] || '').endsWith(',');

						let valueNode;
						if (valueString.startsWith('"')) {
							valueNode = <Text color={theme.success}>{valueString}</Text>;
						} else if (valueString === 'true' || valueString === 'false') {
							valueNode = <Text color={theme.accent}>{valueString}</Text>;
						} else if (valueString === 'null') {
							valueNode = <Text color={theme.muted}>{valueString}</Text>;
						} else if (['{', '['].includes(valueString)) {
							valueNode = <Text color={theme.muted}>{valueString}</Text>;
						} else {
							valueNode = <Text color={theme.secondary}>{valueString}</Text>;
						}

						return (
							<Text key={i}>
								<Text>{indent}</Text>
								<Text color={theme.primary}>"{key}"</Text>
								<Text>: </Text>
								{valueNode}
								{hasComma && <Text>,</Text>}
							</Text>
						);
					}

					let color: keyof ThemeColors = 'white';
					const value = trimmedLine.replace(/,$/, '');
					const hasComma = trimmedLine.endsWith(',');

					if (value.startsWith('"')) color = 'success';
					else if (value === 'true' || value === 'false') color = 'accent';
					else if (value === 'null') color = 'muted';
					else if (['{', '}', '[', ']'].includes(value)) color = 'muted';
					else if (!isNaN(Number(value))) color = 'secondary';

					return (
						<Text key={i}>
							<Text>{indent}</Text>
							<Text color={theme[color]}>{value}</Text>
							{hasComma && <Text>,</Text>}
						</Text>
					);
				})}
			</Box>
		);
	} catch (e) {
		return <Text color={theme.error}>{jsonString}</Text>;
	}
});

const ResponsePanel = React.memo<{ response: { statustext: string; status: string; headers: string; body: string; error: string; }; theme: ThemeColors }>(({ response, theme }) => (
	<ScrollableBox>
		<Box flexDirection="column" gap={1}>
			<Box><Box width={8}><Text color={theme.primary}>STATUS:</Text></Box><Text color={getStatusColor(response.status, theme)} bold>{response.status} {response.statustext}</Text></Box>
			<Box><Box width={8}><Text color={theme.primary}>HEADERS:</Text></Box>
				<Box flexDirection="column">
					{Object.entries(JSON.parse(response.headers || '{}')).map(([key, value]) => (
						<Text key={key}><Text color={theme.accent}>{key}</Text><Text color={theme.muted}>: </Text><Text color={theme.success}>{String(value)}</Text></Text>
					))}
				</Box>
			</Box>
			<Box><Box width={8}><Text color={theme.primary}>PAYLOAD:</Text></Box>
				<Box flexDirection="column" flexGrow={1}>
					<JsonSyntaxHighlight jsonString={response.body} theme={theme} />
				</Box>
			</Box>
		</Box>
	</ScrollableBox>
));

const Footer = React.memo<{ theme: ThemeColors }>(({ theme }) => {
	return (
		<Box borderStyle="classic" borderTopColor={theme.muted} marginTop={1} paddingX={1}>
			<Text color={theme.cool}>
				╰─ 🚀 <Text color={theme.primary}>PostBoy</Text> — [Q] Quit | [Ctrl+Enter] Send | [Ctrl+L/H] Switch Tabs | [T] Theme Menu | [Tab] Navigate
			</Text>
		</Box>
	);
});

const ThemeSelector: React.FC<{ onThemeChange: (themeName: keyof typeof themes) => void, theme: ThemeColors }> = ({ onThemeChange, theme }) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const themeNames = Object.keys(themes) as Array<keyof typeof themes>;
	useEffect(() => {
		const currentThemeIndex = themeNames.findIndex(name => {
			const themeColors = themes[name].colors;
			return Object.entries(themeColors).every(([key, value]) => theme[key as keyof typeof theme] === value);
		});
		if (currentThemeIndex !== -1) {
			setSelectedIndex(currentThemeIndex);
		}
	}, [theme, themeNames]);

	useInput((_, key) => {
		if (key.upArrow) {
			const newIndex = Math.max(0, selectedIndex - 1);
			setSelectedIndex(newIndex);
			if (themeNames[newIndex]) {
				onThemeChange(themeNames[newIndex]);
			}
		}
		if (key.downArrow) {
			const newIndex = Math.min(themeNames.length - 1, selectedIndex + 1);
			setSelectedIndex(newIndex);
			if (themeNames[newIndex]) {
				onThemeChange(themeNames[newIndex]);
			}
		}
	}, { isActive: true });

	return (
		<Box flexDirection="column" padding={1} borderStyle="classic" borderColor={theme.accent}>
			<Box marginBottom={1}>
				<Text color={theme.primary} bold>Theme Menu (↑/↓ to change, Esc to close)</Text>
			</Box>
			{themeNames.map((name, idx) => (
				<Box key={name} paddingX={1}>
					<Text color={idx === selectedIndex ? theme.accent : theme.muted}>
						{idx === selectedIndex ? '▶ ' : '  '}{themes[name].name}
					</Text>
				</Box>
			))}
		</Box>
	);
};

const UI = () => {
	const [theme, setTheme] = useState<ThemeColors>(themes.catppuccin.colors);
	const { exit } = useApp();
	const [activeTab, setActiveTab] = useState('request');
	const [request, setRequest] = useState<Request>({ method: 'GET', url: '', headers: '', body: '' });
	const [response, setResponse] = useState({ statustext: '', status: '', headers: '', body: '', error: '' });
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const requestRef = useRef(request);
	requestRef.current = request;

	useEffect(() => {
		const loadHistory = async () => setHistory((await historyManager.loadHistory()).entries);
		loadHistory();
	}, []);

	const handleSend = useCallback(async () => {
		setLoading(true);
		const startTime = Date.now();
		const currentRequest = requestRef.current;
		try {
			let parsedHeaders: Record<string, string> = {};
			let parsedBody: any;
			try {
				if (currentRequest.headers) parsedHeaders = JSON.parse(currentRequest.headers);
				if (currentRequest.body) parsedBody = JSON.parse(currentRequest.body);
			} catch (e: any) {
				setResponse({ status: 'Error', statustext: 'Invalid JSON', headers: '{}', body: e.message, error: e.message });
				setActiveTab('response');
				setLoading(false);
				return;
			}
			const reqBody = parsedBody ? JSON.stringify(parsedBody) : undefined;
			const res = await sendRequest({
				method: currentRequest.method,
				url: currentRequest.url,
				headers: parsedHeaders,
				body: reqBody,
			});
			const responseTime = Date.now() - startTime;
			await historyManager.addEntry({ ...currentRequest }, res.status, responseTime);
			setHistory((await historyManager.loadHistory()).entries);
			setResponse({ statustext: res.statusText, status: res.status.toString(), headers: JSON.stringify(res.headers), body: res.body, error: res.status >= 200 && res.status < 400 ? '' : `Error: ${res.statusText}` });
			setActiveTab('response');
		} catch (error: any) {
			setResponse({ status: 'Error', statustext: 'Request Failed', headers: '{}', body: error.message, error: error.message });
			setActiveTab('response');
		} finally {
			setLoading(false);
		}
	}, []);

	const handleHistoryClick = useCallback((item: HistoryEntry) => {
		setRequest({
			method: item.method as Request['method'],
			url: item.url,
			headers: typeof item.headers === 'object' ? JSON.stringify(item.headers, null, 2) : item.headers || '',
			body: typeof item.body === 'object' ? JSON.stringify(item.body, null, 2) : item.body || ''
		});
		setActiveTab('request');
	}, []);

	const tabs = [{ name: 'request', label: 'Request' }, { name: 'response', label: 'Response' }];
	const activeIndex = tabs.findIndex(t => t.name === activeTab);

	const [showThemeSelector, setShowThemeSelector] = useState(false);

	useInput((input, key) => {
		if (input === 'q') exit();
		if (key.ctrl && key.return) handleSend();
		if (key.ctrl && input === 'l') setActiveTab(tabs[(activeIndex + 1) % tabs.length]?.name ?? 'request');
		if (key.ctrl && input === 'h') setActiveTab(tabs[(activeIndex - 1 + tabs.length) % tabs.length]?.name ?? 'request');
		if (key.escape && showThemeSelector) setShowThemeSelector(false);
		if ((input === 't' || input === 'T') && !key.ctrl && !key.meta) setShowThemeSelector(prev => !prev);
	}, { isActive: true });

	const onMethodChange = useCallback((method: string) => setRequest(r => ({ ...r, method: method as Request['method'] })), []);
	const onUrlChange = useCallback((url: string) => setRequest(r => ({ ...r, url })), []);
	const onHeadersChange = useCallback((headers: string) => setRequest(r => ({ ...r, headers })), []);
	const onBodyChange = useCallback((body: string) => setRequest(r => ({ ...r, body })), []);

	// Gather unique URLs from history for autocomplete
	const historyUrls = Array.from(new Set(history.map(h => h.url))).filter(Boolean);

	return (
		<Box padding={1} flexDirection="column" flexGrow={1}>
			{showThemeSelector && (
				<Box flexDirection="row" justifyContent="center" marginBottom={1}>
					<ThemeSelector theme={theme} onThemeChange={(themeName) => setTheme(themes[themeName].colors)} />
				</Box>
			)}
			<Box alignSelf='center' marginBottom={1}>
				<Text color={theme.accent} bold>
					{`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`}
				</Text>
			</Box>
			<Box alignSelf="center" marginBottom={1}>
				<Text color={theme.primary} bold>
					{`┃   🛰️  Welcome to PostBoy — The Modern Terminal API Client   ┃`}
				</Text>
			</Box>
			<Box alignSelf="center" marginBottom={1}>
				<Text color={theme.accent} bold>
					{`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`}
				</Text>
			</Box>
			<Box flexGrow={1}>
				<Box width="40%" borderStyle="classic" borderColor={theme.muted} flexDirection="column" marginRight={1}>
					<Box borderStyle="classic" borderTopColor={'grey'} borderColor={theme.secondary} paddingX={1} alignSelf="center"><Text color={theme.accent} bold>📜 History</Text></Box>
					<Box flexDirection="column" flexGrow={1}>
						{history.length === 0 ? <Box padding={1}><Text color={theme.muted}>No requests yet...</Text></Box> : (
							<HistoryList history={history} onItemClick={handleHistoryClick} theme={theme} />
						)}
					</Box>
				</Box>
				<Box width="60%" borderStyle="classic" borderColor={theme.muted} padding={1} flexDirection="column">
					<Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} theme={theme} />
					<Box marginTop={1} flexDirection="column" flexGrow={1}>
						<Box display={activeTab === 'request' ? 'flex' : 'none'} flexGrow={1}>
							<RequestPanel request={request} onMethodChange={onMethodChange} onUrlChange={onUrlChange} onHeadersChange={onHeadersChange} onBodyChange={onBodyChange} onSend={handleSend} loading={loading} theme={theme} historyUrls={historyUrls} />
						</Box>
						<Box display={activeTab === 'response' ? 'flex' : 'none'} flexGrow={1}>
							<ResponsePanel response={response} theme={theme} />
						</Box>
					</Box>
				</Box>
			</Box>
			<Footer theme={theme} />
		</Box>
	);
};

export default UI;

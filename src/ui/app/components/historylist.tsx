import { Box, Text, useFocus, useFocusManager, useInput, useStdout } from "ink";
import TextInput from "ink-text-input";
import { useEffect, useRef, useState } from "react";
import type { HistoryEntry, Theme } from "../../../types";
import { getStatusColor } from "../../../utils/colors";
import { fuzzyFilter } from "../../../utils/fuzzy";



export const HistoryListItem: React.FC<{ item: HistoryEntry; isSelected: boolean; theme: Theme }> = ({ item, isSelected, theme }) => {
	const shortenUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			const path = urlObj.pathname.length > 20 ? `${urlObj.pathname.slice(0, 17)}...` : urlObj.pathname;
			return `${urlObj.hostname}${path}`;
		} catch { return url.length > 30 ? `${url.slice(0, 27)}...` : url; }
	};
	const statusColor = item.responseStatus ? getStatusColor(item.responseStatus.toString(), theme) : theme.colors.muted;
	return (
		<Box paddingX={1} borderColor={isSelected ? theme.colors.accent : 'transparent'}>
			<Box flexDirection="column">
				<Box><Box marginRight={1} width={5}><Text color={statusColor} bold={isSelected}>{String(item.responseStatus || '---').padStart(3, ' ')}</Text></Box><Box width={7}><Text color={isSelected ? theme.colors.accent : theme.colors.primary} bold={isSelected}>{item.method.padEnd(7)}</Text></Box><Box flexGrow={1}><Text color={isSelected ? theme.colors.white : theme.colors.muted}>{shortenUrl(item.url)}</Text></Box></Box>
				<Box paddingLeft={13}><Text color={theme.colors.muted} dimColor={!isSelected}>{item.responseTime ? `${Math.round(item.responseTime)}ms ` : ''}{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}</Text></Box>
			</Box>
		</Box>
	);
};




export const HistoryList: React.FC<{ history: HistoryEntry[]; onItemClick: (item: HistoryEntry) => void; theme: Theme }> = ({ history, onItemClick, theme }) => {
	const { stdout } = useStdout();
	const { isFocused } = useFocus();
	const { focusNext } = useFocusManager();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const listRef = useRef(null);

	const filteredHistory = fuzzyFilter(history, searchQuery, item => `${item.method} ${item.url}`);
	const maxHeight = stdout.rows - 10;

	useInput((input, key) => {
		if (input === '/' && !isSearching) {
			setIsSearching(true);
			return;
		}
		if (key.escape && isSearching) {
			setIsSearching(false);
			setSearchQuery('');
			return;
		}
		if (isSearching) return;
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		}
		if (key.downArrow) {
			setSelectedIndex(prev => Math.min(filteredHistory.length - 1, prev + 1));
		}
		if (key.return && filteredHistory[selectedIndex]) {
			onItemClick(filteredHistory[selectedIndex]);
		}
		if (key.tab) {
			focusNext();
		}
		if (key.pageUp) {
			setScrollPosition(prev => Math.max(0, prev - maxHeight));
		}
		if (key.pageDown) {
			setScrollPosition(prev => Math.min(filteredHistory.length - maxHeight, prev + maxHeight));
		}
	}, { isActive: isFocused });

	useEffect(() => {
		setSelectedIndex(0);
		setScrollPosition(0);
	}, [searchQuery]);

	useEffect(() => {
		if (selectedIndex < scrollPosition) {
			setScrollPosition(selectedIndex);
		} else if (selectedIndex >= scrollPosition + maxHeight) {
			setScrollPosition(selectedIndex - maxHeight + 1);
		}
	}, [selectedIndex, maxHeight, scrollPosition]);

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box paddingX={1} marginBottom={1}>
				{isSearching ? (
					<Box>
						<Text color={theme.colors.accent}>🔍 </Text>
						<TextInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Type to search..."
							focus={isSearching}
						/>
					</Box>
				) : (
					<Text color={theme.colors.muted} dimColor>Press / to search{searchQuery && ` (filtered: "${searchQuery}")`}</Text>
				)}
			</Box>
			<Box flexDirection="column" ref={listRef}>
				{filteredHistory.length === 0 ? (
					<Box paddingX={1}><Text color={theme.colors.muted}>No matches found</Text></Box>
				) : (
					filteredHistory.slice(scrollPosition, scrollPosition + maxHeight).map((item, index) => (
						<HistoryListItem
							key={item.timestamp}
							item={item}
							isSelected={isFocused && selectedIndex === scrollPosition + index}
							theme={theme}
						/>
					))
				)}
			</Box>
		</Box>
	);
};


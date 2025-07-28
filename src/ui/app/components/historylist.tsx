import { Box, Text, useFocus, useFocusManager, useInput, useStdout } from "ink";
import { useEffect, useRef, useState } from "react";
import type { HistoryEntry, ThemeColors } from "../../../types";
import { getStatusColor } from "../../../utils/colors";



export const HistoryListItem: React.FC<{ item: HistoryEntry; isSelected: boolean; theme: ThemeColors }> = ({ item, isSelected, theme }) => {
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




export const HistoryList: React.FC<{ history: HistoryEntry[]; onItemClick: (item: HistoryEntry) => void; theme: ThemeColors }> = ({ history, onItemClick, theme }) => {
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


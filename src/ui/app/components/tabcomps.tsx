import { Box, Text, useFocus, useInput } from "ink";
import type { TabsProps, Theme } from "../../../types";

export const TabItem: React.FC<{ name: string; label: string; isActive: boolean; onChange: (name: string) => void; theme: Theme }> = ({ name, label, isActive, onChange, theme }) => {
	const { isFocused } = useFocus();
	useInput((_, key) => { if (isFocused && key.return) onChange(name); }, { isActive: isFocused });
	return (
		<Box borderStyle="round" borderTopColor={'grey'} borderColor={isActive ? theme.colors.accent : (isFocused ? theme.colors.primary : 'transparent')} paddingX={1} marginRight={1}>
			<Text color={isActive ? theme.colors.accent : (isFocused ? theme.colors.primary : theme.colors.white)} bold={isActive || isFocused}>{label}</Text>
		</Box>
	);
};

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, theme }) => (
	<Box>{tabs.map(tab => <TabItem key={tab.name} {...tab} isActive={activeTab === tab.name} onChange={onChange} theme={theme} />)}</Box>
);

import { Box, Text, useFocus, useInput } from "ink";
import type { TabsProps, ThemeColors } from "../../../types";

export const TabItem: React.FC<{ name: string; label: string; isActive: boolean; onChange: (name: string) => void; theme: ThemeColors }> = ({ name, label, isActive, onChange, theme }) => {
	const { isFocused } = useFocus();
	useInput((_, key) => { if (isFocused && key.return) onChange(name); });
	return (
		<Box borderStyle="classic" borderTopColor={'grey'} borderColor={isActive ? theme.accent : (isFocused ? theme.primary : 'transparent')} paddingX={1} marginRight={1}>
			<Text color={isActive ? theme.accent : (isFocused ? theme.primary : theme.white)} bold={isActive || isFocused}>{label}</Text>
		</Box>
	);
};

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, theme }) => (
	<Box>{tabs.map(tab => <TabItem key={tab.name} {...tab} isActive={activeTab === tab.name} onChange={onChange} theme={theme} />)}</Box>
);

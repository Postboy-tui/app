import { Box, Text } from "ink";
import type { ThemeColors } from "../../../types";
import React from "react";

export const Footer = React.memo<{ theme: ThemeColors }>(({ theme }) => {
	return (
		<Box borderStyle="round" borderTopColor={theme.muted} marginTop={1} paddingX={1}>
			<Text color={theme.cool}>
				╰─ 🚀 <Text color={theme.primary}>PostBoy</Text> — [Q] Quit | [Ctrl+Enter] Send | [Ctrl+L/H] Switch Tabs | [T] Theme Menu | [Tab] Navigate
			</Text>
		</Box>
	);
});



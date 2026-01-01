import React, { useEffect, useState } from "react";
import { themes } from "../themes";
import { Box, Text, useInput } from "ink";
import type { Theme } from "../../../types";


const getIndex = (theme: Theme["name"]): number => {
	let index = 0;
	switch (theme) {
		case "Catppuccin": index = 0;
			break;
		case "Dracula": index = 1;
			break;
		case "Nord": index = 2;
			break;
		case "Gruvbox": index = 3;
			break;
		case "Tokyo Night": index = 4;
			break;
		case "Ayu": index = 5;
			break;
		case "Monokai": index = 6;
			break;
		case "Solarized Dark": index = 7;
			break;
		case "One Dark": index = 8;
			break;
		case "Palenight": index = 9;
			break;
		default: index = 0;
	}
	return index;
}


export const ThemeSelector: React.FC<{ onThemeChange: (themeName: keyof typeof themes) => void, theme: Theme, isActive?: boolean }> = ({ onThemeChange, theme, isActive = true }) => {
	const [selectedIndex, setSelectedIndex] = useState(getIndex(theme.name));
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
	}, { isActive });

	return (
		<Box flexDirection="column" padding={1} borderStyle="round" borderColor={theme.colors.accent} width="50%" alignSelf="center">
			<Box marginBottom={1}>
				<Text color={theme.colors.primary} bold>Theme Menu (↑/↓ to change, Esc to close)</Text>
			</Box>
			{themeNames.map((name, idx) => (
				<Box key={name} paddingX={1}>
					<Text color={idx === selectedIndex ? theme.colors.accent : theme.colors.muted}>
						{idx === selectedIndex ? '▶ ' : '  '}{themes[name].name}
					</Text>
				</Box>
			))}
		</Box>
	);
};



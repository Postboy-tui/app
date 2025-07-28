import React, { useEffect, useState } from "react";
import { themes } from "../themes";
import { Box, Text, useInput } from "ink";
import type { ThemeColors } from "../../../types";

export const ThemeSelector: React.FC<{ onThemeChange: (themeName: keyof typeof themes) => void, theme: ThemeColors }> = ({ onThemeChange, theme }) => {
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



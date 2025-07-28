import { Box, Text, useFocus, useInput } from "ink";
import type { FormFieldProps } from "../../../types";
import { useState, useEffect } from "react";

export const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, placeholder, theme, suggestions = [] }) => {
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
        <Box width={8}><Text color={isFocused ? theme.accent : theme.muted}>{label}:</Text></Box><Box borderStyle="classic" borderColor={isFocused ? theme.primary : theme.muted} paddingX={1} flexGrow={1}>{value ? <Text color={isFocused ? theme.white : theme.primary}>{value}</Text> : <Text color={theme.muted}>{placeholder}</Text>}</Box></Box>{showSuggestions && (<Box flexDirection="column" marginLeft={8} borderStyle="classic" borderColor={theme.muted}>{filteredSuggestions.filter(s => typeof s === 'string' && s.trim().length > 0).map((s, idx) => (<Box key={s || idx}
        ><Text color={idx === highlightedIndex ? theme.white : theme.primary}>{typeof s === 'string' ? s : '[invalid]'}</Text></Box>))}</Box>)}
    </Box>
  );
};

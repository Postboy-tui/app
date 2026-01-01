import { Box, Text, useFocus, useInput } from "ink";
import type { FormFieldProps } from "../../../types";
import { useState, useEffect } from "react";

const InputDialog: React.FC<{
	label: string;
	value: string;
	onChange: (value: string) => void;
	onClose: () => void;
	theme: FormFieldProps['theme'];
	suggestions?: string[];
	isActive?: boolean;
}> = ({ label, value, onChange, onClose, theme, suggestions = [], isActive = true }) => {
	const [localValue, setLocalValue] = useState(value);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
	const [highlightedIndex, setHighlightedIndex] = useState(0);

	useEffect(() => {
		if (suggestions.length > 0 && localValue) {
			const filtered = suggestions.filter(s => s.toLowerCase().startsWith(localValue.toLowerCase()));
			setFilteredSuggestions(filtered);
			setShowSuggestions(filtered.length > 0);
			setHighlightedIndex(0);
		} else {
			setShowSuggestions(false);
		}
	}, [localValue, suggestions]);

	useInput((input, key) => {
		if (key.escape) {
			onClose();
			return;
		}
		if (key.return && !showSuggestions) {
			onChange(localValue);
			onClose();
			return;
		}
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
				setLocalValue(filteredSuggestions[highlightedIndex]);
				setShowSuggestions(false);
			}
			return;
		}
		if (key.backspace || key.delete) {
			setLocalValue(v => v.slice(0, -1));
			return;
		}
		if (!key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.return && !key.tab) {
			setLocalValue(v => v + input);
		}
	}, { isActive });

	return (
		<Box flexDirection="column" borderStyle="double" borderColor={theme.accent} padding={1} marginY={1}>
			<Box marginBottom={1}>
				<Text color={theme.accent} bold>Edit {label}</Text>
				<Text color={theme.muted}> (Enter to save, Esc to cancel)</Text>
			</Box>
			<Box borderStyle="round" borderColor={theme.primary} paddingX={1}>
				<Text color={theme.white}>{localValue}</Text>
				<Text color={theme.accent}>▌</Text>
			</Box>
			{showSuggestions && (
				<Box flexDirection="column" marginTop={1} borderStyle="round" borderColor={theme.muted}>
					{filteredSuggestions.filter(s => typeof s === 'string' && s.trim().length > 0).map((s, idx) => (
						<Box key={s || idx}>
							<Text color={idx === highlightedIndex ? theme.accent : theme.primary}>
								{idx === highlightedIndex ? '▸ ' : '  '}{typeof s === 'string' ? s : '[invalid]'}
							</Text>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
};

export const FormField: React.FC<FormFieldProps & { onFocusChange?: (focused: boolean) => void }> = ({ label, value, onChange, placeholder, theme, suggestions = [], onFocusChange }) => {
	const { isFocused } = useFocus();
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		onFocusChange?.(isFocused || showDialog);
	}, [isFocused, showDialog, onFocusChange]);

	useInput((_, key) => {
		if (isFocused && key.return && !showDialog) {
			setShowDialog(true);
		}
	}, { isActive: isFocused && !showDialog });

	const handleDialogClose = () => {
		setShowDialog(false);
	};

	const handleDialogSave = (newValue: string) => {
		onChange(newValue);
	};

	if (showDialog) {
		return (
			<InputDialog
				label={label}
				value={value}
				onChange={handleDialogSave}
				onClose={handleDialogClose}
				theme={theme}
				suggestions={suggestions}
			/>
		);
	}

	return (
		<Box flexDirection="column">
			<Box>
				<Box width={8}><Text color={isFocused ? theme.accent : theme.muted}>{label}:</Text></Box>
				<Box borderStyle="round" borderColor={isFocused ? theme.primary : theme.muted} paddingX={1} flexGrow={1}>
					{value ? <Text color={isFocused ? theme.white : theme.primary}>{value}</Text> : <Text color={theme.muted}>{placeholder}</Text>}
					{isFocused && <Text color={theme.muted}> (Press Enter to edit)</Text>}
				</Box>
			</Box>
		</Box>
	);
};

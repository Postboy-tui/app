import { Box, Text, useFocus, useInput } from "ink";
import type { ThemeColors } from "../../../types";
import { useState, useEffect } from "react";

interface KeyValuePair {
	key: string;
	value: string;
}

const KeyValueDialog: React.FC<{
	label: string;
	pairs: KeyValuePair[];
	onSave: (pairs: KeyValuePair[]) => void;
	onClose: () => void;
	theme: ThemeColors;
}> = ({ label, pairs, onSave, onClose, theme }) => {
	const [localPairs, setLocalPairs] = useState<KeyValuePair[]>(pairs.length > 0 ? pairs : [{ key: '', value: '' }]);
	const [activeField, setActiveField] = useState<'key' | 'value'>('key');
	const [activeRow, setActiveRow] = useState(0);

	useInput((input, key) => {
		if (key.escape) {
			onClose();
			return;
		}
		if (key.ctrl && key.return) {
			onSave(localPairs.filter(p => p.key.trim() !== ''));
			onClose();
			return;
		}
		if (key.tab) {
			if (activeField === 'key') {
				setActiveField('value');
			} else {
				setActiveField('key');
				if (activeRow < localPairs.length - 1) {
					setActiveRow(r => r + 1);
				}
			}
			return;
		}
		if (key.upArrow) {
			if (activeRow > 0) setActiveRow(r => r - 1);
			return;
		}
		if (key.downArrow) {
			if (activeRow < localPairs.length - 1) setActiveRow(r => r + 1);
			return;
		}
		if (key.return) {
			setLocalPairs(p => [...p, { key: '', value: '' }]);
			setActiveRow(localPairs.length);
			setActiveField('key');
			return;
		}
		if (key.backspace || key.delete) {
			setLocalPairs(p => {
				const newPairs = [...p];
				const current = newPairs[activeRow];
				if (!current) return newPairs;
				if (activeField === 'key') {
					if (current.key === '' && newPairs.length > 1) {
						newPairs.splice(activeRow, 1);
						setActiveRow(Math.max(0, activeRow - 1));
					} else {
						newPairs[activeRow] = { key: current.key.slice(0, -1), value: current.value };
					}
				} else {
					newPairs[activeRow] = { key: current.key, value: current.value.slice(0, -1) };
				}
				return newPairs;
			});
			return;
		}
		if (!key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.return && !key.tab) {
			setLocalPairs(p => {
				const newPairs = [...p];
				const current = newPairs[activeRow];
				if (!current) return newPairs;
				if (activeField === 'key') {
					newPairs[activeRow] = { key: current.key + input, value: current.value };
				} else {
					newPairs[activeRow] = { key: current.key, value: current.value + input };
				}
				return newPairs;
			});
		}
	});

	return (
		<Box flexDirection="column" borderStyle="double" borderColor={theme.accent} padding={1} marginY={1}>
			<Box marginBottom={1}>
				<Text color={theme.accent} bold>Edit {label}</Text>
				<Text color={theme.muted}> (Tab: switch field, Enter: new row, Ctrl+Enter: save, Esc: cancel)</Text>
			</Box>
			<Box flexDirection="column" gap={1}>
				{localPairs.map((pair, idx) => (
					<Box key={idx} gap={1}>
						<Box width={4}>
							<Text color={theme.muted}>{idx + 1}.</Text>
						</Box>
						<Box borderStyle="round" borderColor={idx === activeRow && activeField === 'key' ? theme.accent : theme.muted} paddingX={1} width="40%">
							<Text color={theme.muted}>Key: </Text>
							<Text color={idx === activeRow && activeField === 'key' ? theme.white : theme.primary}>{pair.key}</Text>
							{idx === activeRow && activeField === 'key' && <Text color={theme.accent}>▌</Text>}
						</Box>
						<Box borderStyle="round" borderColor={idx === activeRow && activeField === 'value' ? theme.accent : theme.muted} paddingX={1} flexGrow={1}>
							<Text color={theme.muted}>Value: </Text>
							<Text color={idx === activeRow && activeField === 'value' ? theme.white : theme.primary}>{pair.value}</Text>
							{idx === activeRow && activeField === 'value' && <Text color={theme.accent}>▌</Text>}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};

export const KeyValueField: React.FC<{
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	theme: ThemeColors;
	onFocusChange?: (focused: boolean) => void;
}> = ({ label, value, onChange, placeholder, theme, onFocusChange }) => {
	const { isFocused } = useFocus();
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		onFocusChange?.(isFocused || showDialog);
	}, [isFocused, showDialog, onFocusChange]);

	const parseJsonToPairs = (json: string): KeyValuePair[] => {
		try {
			const obj = JSON.parse(json || '{}');
			return Object.entries(obj).map(([key, val]) => ({ key, value: String(val) }));
		} catch {
			return [];
		}
	};

	const pairsToJson = (pairs: KeyValuePair[]): string => {
		const obj: Record<string, string> = {};
		pairs.forEach(p => {
			if (p.key.trim()) obj[p.key] = p.value;
		});
		return Object.keys(obj).length > 0 ? JSON.stringify(obj) : '';
	};

	useInput((_, key) => {
		if (isFocused && key.return && !showDialog) {
			setShowDialog(true);
		}
	}, { isActive: isFocused && !showDialog });

	const handleDialogClose = () => {
		setShowDialog(false);
	};

	const handleDialogSave = (pairs: KeyValuePair[]) => {
		onChange(pairsToJson(pairs));
	};

	const pairs = parseJsonToPairs(value);
	const displayValue = pairs.length > 0 
		? pairs.map(p => `${p.key}: ${p.value}`).join(', ')
		: '';

	if (showDialog) {
		return (
			<KeyValueDialog
				label={label}
				pairs={pairs}
				onSave={handleDialogSave}
				onClose={handleDialogClose}
				theme={theme}
			/>
		);
	}

	return (
		<Box flexDirection="column">
			<Box>
				<Box width={8}><Text color={isFocused ? theme.accent : theme.muted}>{label}:</Text></Box>
				<Box borderStyle="round" borderColor={isFocused ? theme.primary : theme.muted} paddingX={1} flexGrow={1}>
					{displayValue ? <Text color={isFocused ? theme.white : theme.primary}>{displayValue}</Text> : <Text color={theme.muted}>{placeholder}</Text>}
					{isFocused && <Text color={theme.muted}> (Press Enter to edit)</Text>}
				</Box>
			</Box>
		</Box>
	);
};

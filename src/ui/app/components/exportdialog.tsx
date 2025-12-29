import { Box, Text, useInput } from "ink";
import { useState } from "react";
import type { ThemeColors } from "../../../types";
import { toCurl, toFetch, copyToClipboard, saveToFile } from "../../../utils/export";

interface ExportDialogProps {
	request: { method: string; url: string; headers: string; body: string };
	onClose: () => void;
	theme: ThemeColors;
}

type ExportFormat = 'curl' | 'fetch';
type ExportAction = 'copy' | 'save';

const EXPORT_DIR = `${process.env.HOME}/.postboy/exports`;

export const ExportDialog: React.FC<ExportDialogProps> = ({ request, onClose, theme }) => {
	const [format, setFormat] = useState<ExportFormat>('curl');
	const [action, setAction] = useState<ExportAction>('copy');
	const [showSavePrompt, setShowSavePrompt] = useState(false);
	const [filePath, setFilePath] = useState('');
	const [message, setMessage] = useState('');
	const [activeField, setActiveField] = useState<'format' | 'action' | 'path'>('format');

	const getExportContent = () => {
		return format === 'curl' ? toCurl(request) : toFetch(request);
	};

	const handleExport = async () => {
		const content = getExportContent();
		if (action === 'copy') {
			const success = await copyToClipboard(content);
			setMessage(success ? 'Copied to clipboard!' : 'Failed to copy. Try saving to file.');
			setTimeout(onClose, 1500);
		} else {
			setShowSavePrompt(true);
			setActiveField('path');
		}
	};

	const handleSave = async () => {
		if (!filePath.trim()) {
			setMessage('Please enter a file path');
			return;
		}
		const content = getExportContent();
		const ext = format === 'curl' ? '.sh' : '.js';
		const fileName = filePath.endsWith(ext) ? filePath : filePath + ext;
		const finalPath = `${EXPORT_DIR}/${fileName}`;
		const success = await saveToFile(content, finalPath);
		setMessage(success ? `✓ File saved to:\n${finalPath}` : 'Failed to save file');
		setTimeout(onClose, 3000);
	};

	useInput((input, key) => {
		if (key.escape) {
			if (showSavePrompt) {
				setShowSavePrompt(false);
				setActiveField('action');
			} else {
				onClose();
			}
			return;
		}

		if (showSavePrompt) {
			if (key.return) {
				handleSave();
				return;
			}
			if (key.backspace || key.delete) {
				setFilePath(p => p.slice(0, -1));
				return;
			}
			if (!key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.tab) {
				setFilePath(p => p + input);
			}
			return;
		}

		if (key.tab) {
			setActiveField(f => f === 'format' ? 'action' : 'format');
			return;
		}

		if (key.return) {
			handleExport();
			return;
		}

		if (activeField === 'format') {
			if (key.leftArrow || key.rightArrow || input === 'h' || input === 'l') {
				setFormat(f => f === 'curl' ? 'fetch' : 'curl');
			}
		} else if (activeField === 'action') {
			if (key.leftArrow || key.rightArrow || input === 'h' || input === 'l') {
				setAction(a => a === 'copy' ? 'save' : 'copy');
			}
		}
	});

	const preview = getExportContent();

	return (
		<Box flexDirection="column" borderStyle="double" borderColor={theme.accent} padding={1}>
			<Box marginBottom={1}>
				<Text color={theme.accent} bold>Export Request</Text>
				<Text color={theme.muted}> (Tab: switch, ←→: select, Enter: confirm, Esc: cancel)</Text>
			</Box>

			{message ? (
				<Box padding={1} flexDirection="column" borderStyle="round" borderColor={theme.success}>
					{message.split('\n').map((line, i) => (
						<Text key={i} color={theme.success} bold>{line}</Text>
					))}
				</Box>
			) : showSavePrompt ? (
				<Box flexDirection="column" gap={1}>
					<Box>
						<Text color={theme.primary}>File path: </Text>
						<Box borderStyle="round" borderColor={theme.accent} paddingX={1} flexGrow={1}>
							<Text color={theme.white}>{filePath}</Text>
							<Text color={theme.accent}>▌</Text>
						</Box>
					</Box>
					<Text color={theme.muted}>Extension .{format === 'curl' ? 'sh' : 'js'} will be added if not specified</Text>
				</Box>
			) : (
				<Box flexDirection="column" gap={1}>
					<Box gap={2}>
						<Text color={theme.primary}>Format: </Text>
						<Box borderStyle="round" borderColor={activeField === 'format' && format === 'curl' ? theme.accent : theme.muted} paddingX={1}>
							<Text color={format === 'curl' ? theme.accent : theme.muted} bold={format === 'curl'}>cURL</Text>
						</Box>
						<Box borderStyle="round" borderColor={activeField === 'format' && format === 'fetch' ? theme.accent : theme.muted} paddingX={1}>
							<Text color={format === 'fetch' ? theme.accent : theme.muted} bold={format === 'fetch'}>Fetch</Text>
						</Box>
					</Box>

					<Box gap={2}>
						<Text color={theme.primary}>Action: </Text>
						<Box borderStyle="round" borderColor={activeField === 'action' && action === 'copy' ? theme.accent : theme.muted} paddingX={1}>
							<Text color={action === 'copy' ? theme.accent : theme.muted} bold={action === 'copy'}>Copy to Clipboard</Text>
						</Box>
						<Box borderStyle="round" borderColor={activeField === 'action' && action === 'save' ? theme.accent : theme.muted} paddingX={1}>
							<Text color={action === 'save' ? theme.accent : theme.muted} bold={action === 'save'}>Save to File</Text>
						</Box>
					</Box>

					<Box flexDirection="column" marginTop={1}>
						<Text color={theme.primary}>Preview:</Text>
						<Box borderStyle="round" borderColor={theme.muted} padding={1} flexDirection="column">
							{preview.split('\n').map((line, i) => (
								<Text key={i} color={theme.white}>{line}</Text>
							))}
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
};

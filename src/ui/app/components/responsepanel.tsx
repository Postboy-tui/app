import { Box, Text } from "ink";
import { ScrollableBox } from "./scrollablebox";
import { JsonSyntaxHighlight } from "./syntaxhighlighter";
import React, { useState, useEffect, useRef } from "react";
import type { Theme } from "../../../types";
import { Tabs } from "./tabcomps";

const StatusBadge: React.FC<{ status: string; statusText: string; theme: Theme }> = ({ status, statusText, theme }) => {
	const [glowFrame, setGlowFrame] = useState(0);
	const statusNum = parseInt(status, 10);
	
	useEffect(() => {
		const interval = setInterval(() => {
			setGlowFrame(prev => (prev + 1) % 4);
		}, 300);
		return () => clearInterval(interval);
	}, []);

	const getStatusIcon = () => {
		if (statusNum >= 200 && statusNum < 300) return ['✓', '✔', '☑', '✓'][glowFrame];
		if (statusNum >= 300 && statusNum < 400) return ['↪', '→', '⇒', '↪'][glowFrame];
		if (statusNum >= 400 && statusNum < 500) return ['⚠', '⚡', '⚠', '⚡'][glowFrame];
		if (statusNum >= 500) return ['✗', '✘', '☒', '✗'][glowFrame];
		return '●';
	};

	const getBadgeStyle = () => {
		if (statusNum >= 200 && statusNum < 300) return { bg: theme.colors.success, icon: getStatusIcon(), label: 'SUCCESS' };
		if (statusNum >= 300 && statusNum < 400) return { bg: theme.colors.accent, icon: getStatusIcon(), label: 'REDIRECT' };
		if (statusNum >= 400 && statusNum < 500) return { bg: theme.colors.error, icon: getStatusIcon(), label: 'CLIENT ERR' };
		if (statusNum >= 500) return { bg: theme.colors.error, icon: getStatusIcon(), label: 'SERVER ERR' };
		return { bg: theme.colors.muted, icon: '●', label: 'UNKNOWN' };
	};

	const style = getBadgeStyle();
	const glowChars = ['░', '▒', '▓', '▒'];

	if (!status || status === 'Error') {
		return (
			<Box>
				<Text color={theme.colors.error} bold>✗ </Text>
				<Text color={theme.colors.error}>{statusText || 'Error'}</Text>
			</Box>
		);
	}

	return (
		<Box>
			<Text color={style.bg} dimColor>{glowChars[glowFrame]}</Text>
			<Text backgroundColor={style.bg} color={theme.colors.white} bold> {style.icon} {status} </Text>
			<Text color={style.bg} dimColor>{glowChars[glowFrame]}</Text>
			<Text color={theme.colors.muted}> │ </Text>
			<Text color={style.bg} bold>{style.label}</Text>
			<Text color={theme.colors.muted}> │ </Text>
			<Text color={theme.colors.white}>{statusText}</Text>
		</Box>
	);
};

const TypewriterText: React.FC<{ text: string; theme: Theme; speed?: number }> = ({ text, theme, speed = 2 }) => {
	const [displayedLength, setDisplayedLength] = useState(0);
	const [cursorVisible, setCursorVisible] = useState(true);
	const previousTextRef = useRef<string>('');

	useEffect(() => {
		if (text !== previousTextRef.current) {
			setDisplayedLength(0);
			previousTextRef.current = text;
		}
	}, [text]);

	useEffect(() => {
		if (displayedLength < text.length) {
			const charsToAdd = Math.min(speed, text.length - displayedLength);
			const timeout = setTimeout(() => {
				setDisplayedLength(prev => Math.min(prev + charsToAdd, text.length));
			}, 5);
			return () => clearTimeout(timeout);
		}
	}, [displayedLength, text, speed]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCursorVisible(prev => !prev);
		}, 400);
		return () => clearInterval(interval);
	}, []);

	const displayedText = text.slice(0, displayedLength);
	const isComplete = displayedLength >= text.length;
	const cursor = !isComplete && cursorVisible ? '█' : !isComplete ? ' ' : '';

	return (
		<Box flexDirection="column">
			<JsonSyntaxHighlight jsonString={displayedText} theme={theme} />
			{!isComplete && <Text color={theme.colors.accent}>{cursor}</Text>}
		</Box>
	);
};

export const ResponsePanel = React.memo<{ response: { statustext: string; status: string; headers: string; body: string; error: string; }; theme: Theme }>(({ response, theme }) => {
	const [activeTab, setActiveTab] = useState('body');
	const tabs = [{ name: 'body', label: 'Body' }, { name: 'headers', label: 'Headers' }];

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<StatusBadge status={response.status} statusText={response.statustext} theme={theme} />
			</Box>
			<Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} theme={theme} />
			<Box marginTop={1} flexGrow={1}>
				{activeTab === 'headers' && (
					<ScrollableBox>
						<Box flexDirection="column">
							{Object.entries(JSON.parse(response.headers || '{}')).map(([key, value]) => (
								<Text key={key}><Text color={theme.colors.accent}>{key}</Text><Text color={theme.colors.muted}>: </Text><Text color={theme.colors.success}>{String(value)}</Text></Text>
							))}
						</Box>
					</ScrollableBox>
				)}
				{activeTab === 'body' && (
					<ScrollableBox>
						<Box flexDirection="column" flexGrow={1}>
							<TypewriterText text={response.body} theme={theme} speed={50} />
						</Box>
					</ScrollableBox>
				)}
			</Box>
		</Box>
	);
});

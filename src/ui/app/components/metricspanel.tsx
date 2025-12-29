import { Box, Text } from "ink";
import React, { useState, useEffect } from "react";
import type { PerformanceMetrics, Theme } from "../../../types";

interface MetricBarProps {
	label: string;
	value: number;
	maxValue: number;
	color: string;
	theme: Theme;
	delay: number;
}

const BAR_CHARS = ['▱', '▰'];
const GLOW_FRAMES = ['◐', '◓', '◑', '◒'];
const SPARK_CHARS = ['⚡', '✦', '✧', '⚡', '★', '☆'];

const MetricBar: React.FC<MetricBarProps> = ({ label, value, maxValue, color, theme, delay }) => {
	const barWidth = 30;
	const safeValue = Math.max(0, value);
	const targetFilled = Math.max(0, Math.min(barWidth, maxValue > 0 ? Math.round((safeValue / maxValue) * barWidth) : 0));
	
	const [animatedFilled, setAnimatedFilled] = useState(0);
	const [glowFrame, setGlowFrame] = useState(0);
	const [sparkle, setSparkle] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (animatedFilled < targetFilled) {
				const interval = setInterval(() => {
					setAnimatedFilled(prev => {
						if (prev >= targetFilled) {
							clearInterval(interval);
							setSparkle(true);
							setTimeout(() => setSparkle(false), 300);
							return targetFilled;
						}
						return prev + 1;
					});
				}, 20);
				return () => clearInterval(interval);
			}
		}, delay);
		return () => clearTimeout(timeout);
	}, [targetFilled, delay]);

	useEffect(() => {
		const interval = setInterval(() => {
			setGlowFrame(prev => (prev + 1) % GLOW_FRAMES.length);
		}, 150);
		return () => clearInterval(interval);
	}, []);

	const filledBar = BAR_CHARS[1]!.repeat(animatedFilled);
	const emptyBar = BAR_CHARS[0]!.repeat(barWidth - animatedFilled);
	const indicator = animatedFilled > 0 && animatedFilled < targetFilled ? GLOW_FRAMES[glowFrame] : (sparkle ? SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)] : '');

	return (
		<Box marginY={0}>
			<Box width={16}>
				<Text color={color} bold>{label}</Text>
			</Box>
			<Text color={theme.colors.muted}>│</Text>
			<Box width={barWidth + 3}>
				<Text color={color}>{filledBar}</Text>
				<Text color={color} bold>{indicator}</Text>
				<Text color={theme.colors.muted} dimColor>{emptyBar}</Text>
			</Box>
			<Text color={theme.colors.muted}>│</Text>
			<Box width={10} justifyContent="flex-end">
				<Text color={theme.colors.white} bold>{safeValue.toFixed(1)}</Text>
				<Text color={theme.colors.muted} dimColor>ms</Text>
			</Box>
		</Box>
	);
};

const formatBytes = (bytes: number): string => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const AnimatedValue: React.FC<{ value: number; suffix: string; color: string }> = ({ value, suffix, color }) => {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		const duration = 500;
		const steps = 20;
		const increment = value / steps;
		let current = 0;
		const interval = setInterval(() => {
			current += increment;
			if (current >= value) {
				setDisplayValue(value);
				clearInterval(interval);
			} else {
				setDisplayValue(current);
			}
		}, duration / steps);
		return () => clearInterval(interval);
	}, [value]);

	return (
		<Text color={color} bold>{displayValue.toFixed(2)} {suffix}</Text>
	);
};

const PulsingDot: React.FC<{ color: string }> = ({ color }) => {
	const [frame, setFrame] = useState(0);
	const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

	useEffect(() => {
		const interval = setInterval(() => {
			setFrame(prev => (prev + 1) % frames.length);
		}, 80);
		return () => clearInterval(interval);
	}, []);

	return <Text color={color}>{frames[frame]}</Text>;
};

interface TimelineSegment {
	label: string;
	value: number;
	color: string;
	icon: string;
}

const TimelineWaterfall: React.FC<{ metrics: PerformanceMetrics; theme: Theme }> = ({ metrics, theme }) => {
	const [animationProgress, setAnimationProgress] = useState(0);
	const [pulseFrame, setPulseFrame] = useState(0);
	const totalWidth = 50;

	const segments: TimelineSegment[] = [
		{ label: 'DNS', value: Math.max(0, metrics.dnsLookup), color: theme.colors.cool, icon: '⚡' },
		{ label: 'TCP', value: Math.max(0, metrics.tcpConnection), color: theme.colors.success, icon: '🔌' },
		...(metrics.tlsHandshake > 0 ? [{ label: 'TLS', value: Math.max(0, metrics.tlsHandshake), color: theme.colors.secondary, icon: '🔐' }] : []),
		{ label: 'TTFB', value: Math.max(0, metrics.ttfb), color: theme.colors.accent, icon: '⏱️' },
		{ label: 'DL', value: Math.max(0, metrics.contentDownload), color: theme.colors.primary, icon: '📥' },
	];

	const totalTime = segments.reduce((sum, s) => sum + s.value, 0);

	useEffect(() => {
		setAnimationProgress(0);
		const interval = setInterval(() => {
			setAnimationProgress(prev => {
				if (prev >= 100) {
					clearInterval(interval);
					return 100;
				}
				return prev + 2;
			});
		}, 15);
		return () => clearInterval(interval);
	}, [metrics]);

	useEffect(() => {
		const interval = setInterval(() => {
			setPulseFrame(prev => (prev + 1) % 4);
		}, 200);
		return () => clearInterval(interval);
	}, []);

	const pulseChars = ['▁', '▂', '▃', '▄'];
	const endCaps = ['◀', '▶'];

	return (
		<Box flexDirection="column" marginY={1}>
			<Box marginBottom={1}>
				<Text color={theme.colors.accent} bold>⏳ Request Timeline</Text>
				<Text color={theme.colors.muted}> ({totalTime.toFixed(0)}ms total)</Text>
			</Box>
			<Box>
				<Text color={theme.colors.muted}>{endCaps[0]}</Text>
				{segments.map((segment, idx) => {
					const segmentWidth = Math.max(1, Math.round((segment.value / totalTime) * totalWidth));
					const animatedWidth = Math.round((animationProgress / 100) * segmentWidth);
					const filledPart = '█'.repeat(Math.max(0, animatedWidth));
					const emptyPart = '░'.repeat(Math.max(0, segmentWidth - animatedWidth));
					
					return (
						<Text key={idx}>
							<Text color={segment.color}>{filledPart}</Text>
							<Text color={segment.color} dimColor>{emptyPart}</Text>
						</Text>
					);
				})}
				<Text color={theme.colors.muted}>{endCaps[1]}</Text>
				{animationProgress < 100 && (
					<Text color={theme.colors.accent}> {pulseChars[pulseFrame]}</Text>
				)}
				{animationProgress >= 100 && (
					<Text color={theme.colors.success}> ✓</Text>
				)}
			</Box>
			<Box marginTop={1} flexWrap="wrap">
				{segments.map((segment, idx) => (
					<Box key={idx} marginRight={2}>
						<Text color={segment.color}>■</Text>
						<Text color={theme.colors.muted}> {segment.label} </Text>
						<Text color={theme.colors.white} bold>{segment.value.toFixed(0)}</Text>
						<Text color={theme.colors.muted} dimColor>ms</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
};

interface MetricsPanelProps {
	metrics: PerformanceMetrics | null;
	theme: Theme;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, theme }) => {
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		if (metrics) {
			setShowContent(false);
			const timeout = setTimeout(() => setShowContent(true), 100);
			return () => clearTimeout(timeout);
		}
	}, [metrics]);

	if (!metrics) {
		return (
			<Box flexDirection="column" padding={1} alignItems="center">
				<Box marginBottom={1}>
					<PulsingDot color={theme.colors.muted} />
					<Text color={theme.colors.muted}> Waiting for request...</Text>
				</Box>
				<Text color={theme.colors.muted} dimColor>Send a request to see metrics</Text>
			</Box>
		);
	}

	const maxTime = Math.max(
		Math.max(0, metrics.dnsLookup),
		Math.max(0, metrics.tcpConnection),
		Math.max(0, metrics.tlsHandshake),
		Math.max(0, metrics.ttfb),
		Math.max(0, metrics.contentDownload),
		1
	);

	if (!showContent) {
		return (
			<Box flexDirection="column" padding={1} alignItems="center">
				<PulsingDot color={theme.colors.accent} />
				<Text color={theme.colors.accent}> Analyzing...</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={1}>
			<TimelineWaterfall metrics={metrics} theme={theme} />

			<Box marginTop={1} flexDirection="column">
				<Text color={theme.colors.muted}>┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈</Text>
			</Box>

			<Box flexDirection="column" gap={0}>
				<MetricBar label="⚡ DNS" value={metrics.dnsLookup} maxValue={maxTime} color={theme.colors.cool} theme={theme} delay={0} />
				<MetricBar label="🔌 TCP" value={metrics.tcpConnection} maxValue={maxTime} color={theme.colors.success} theme={theme} delay={100} />
				{metrics.tlsHandshake > 0 && (
					<MetricBar label="🔐 TLS" value={metrics.tlsHandshake} maxValue={maxTime} color={theme.colors.secondary} theme={theme} delay={200} />
				)}
				<MetricBar label="⏱️  TTFB" value={metrics.ttfb} maxValue={maxTime} color={theme.colors.accent} theme={theme} delay={300} />
				<MetricBar label="📥 Download" value={metrics.contentDownload} maxValue={maxTime} color={theme.colors.primary} theme={theme} delay={400} />
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text color={theme.colors.muted}>┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈</Text>
			</Box>

			<Box marginTop={1} flexDirection="column" gap={0}>
				<Box>
					<Box width={12}><Text color={theme.colors.accent}>⚡ Total</Text></Box>
					<AnimatedValue value={metrics.total} suffix="ms" color={theme.colors.white} />
				</Box>
				<Box>
					<Box width={12}><Text color={theme.colors.accent}>📦 Size</Text></Box>
					<Text color={theme.colors.white} bold>{formatBytes(metrics.contentLength)}</Text>
				</Box>
				{metrics.contentLength > 0 && metrics.contentDownload > 0 && (
					<Box>
						<Box width={12}><Text color={theme.colors.accent}>🚀 Speed</Text></Box>
						<Text color={theme.colors.success} bold>{formatBytes(metrics.contentLength / (metrics.contentDownload / 1000))}/s</Text>
					</Box>
				)}
			</Box>
		</Box>
	);
};

import { Box, Text } from "ink";
import React from "react";
import type { PerformanceMetrics, Theme } from "../../../types";

interface MetricBarProps {
	label: string;
	value: number;
	maxValue: number;
	color: string;
	theme: Theme;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, maxValue, color, theme }) => {
	const barWidth = 40;
	const safeValue = Math.max(0, value);
	const filledWidth = Math.max(0, Math.min(barWidth, maxValue > 0 ? Math.round((safeValue / maxValue) * barWidth) : 0));
	const emptyWidth = barWidth - filledWidth;
	const bar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);

	return (
		<Box marginY={0}>
			<Box width={18}>
				<Text color={theme.colors.muted}>{label}</Text>
			</Box>
			<Box width={barWidth + 2}>
				<Text color={color}>{bar}</Text>
			</Box>
			<Box width={12} justifyContent="flex-end">
				<Text color={theme.colors.white} bold>{safeValue.toFixed(1)}ms</Text>
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

interface MetricsPanelProps {
	metrics: PerformanceMetrics | null;
	theme: Theme;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, theme }) => {
	if (!metrics) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color={theme.colors.muted}>No metrics available. Send a request first.</Text>
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

	return (
		<Box flexDirection="column" paddingX={1}>
			<Box marginBottom={1} flexDirection="column">
				<Text color={theme.colors.accent} bold>⚡ Performance Breakdown</Text>
				<Text color={theme.colors.muted}>────────────────────────────────────────────────────────────</Text>
			</Box>

			<Box flexDirection="column" gap={0}>
				<MetricBar label="🔍 DNS Lookup" value={metrics.dnsLookup} maxValue={maxTime} color={theme.colors.cool} theme={theme} />
				<MetricBar label="🔌 TCP Connect" value={metrics.tcpConnection} maxValue={maxTime} color={theme.colors.success} theme={theme} />
				{metrics.tlsHandshake > 0 && (
					<MetricBar label="🔐 TLS Handshake" value={metrics.tlsHandshake} maxValue={maxTime} color={theme.colors.secondary} theme={theme} />
				)}
				<MetricBar label="⏱️  TTFB" value={metrics.ttfb} maxValue={maxTime} color={theme.colors.accent} theme={theme} />
				<MetricBar label="📥 Download" value={metrics.contentDownload} maxValue={maxTime} color={theme.colors.primary} theme={theme} />
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text color={theme.colors.muted}>────────────────────────────────────────────────────────────</Text>
			</Box>

			<Box marginTop={1} flexDirection="column" gap={0}>
				<Box>
					<Box width={18}><Text color={theme.colors.accent} bold>📊 Total Time</Text></Box>
					<Text color={theme.colors.white} bold>{metrics.total.toFixed(2)} ms</Text>
				</Box>
				<Box>
					<Box width={18}><Text color={theme.colors.accent} bold>📦 Size</Text></Box>
					<Text color={theme.colors.white} bold>{formatBytes(metrics.contentLength)}</Text>
				</Box>
				{metrics.contentLength > 0 && metrics.contentDownload > 0 && (
					<Box>
						<Box width={18}><Text color={theme.colors.accent} bold>🚀 Speed</Text></Box>
						<Text color={theme.colors.success} bold>{formatBytes(metrics.contentLength / (metrics.contentDownload / 1000))}/s</Text>
					</Box>
				)}
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text color={theme.colors.muted}>────────────────────────────────────────────────────────────</Text>
				<Box marginTop={1}>
					<Text color={theme.colors.muted} dimColor>
						TTFB = Time To First Byte (DNS + TCP + TLS + Server Processing)
					</Text>
				</Box>
			</Box>
		</Box>
	);
};

import { Box, Text } from "ink";
import { ScrollableBox } from "./scrollablebox";
import { JsonSyntaxHighlight } from "./syntaxhighlighter";
import React, { useState } from "react";
import { getStatusColor } from "../../../utils/colors";
import type { PerformanceMetrics, Theme } from "../../../types";
import { Tabs } from "./tabcomps";
import { MetricsPanel } from "./metricspanel";

export const ResponsePanel = React.memo<{ response: { statustext: string; status: string; headers: string; body: string; error: string; }; theme: Theme; metrics?: PerformanceMetrics | null }>(({ response, theme, metrics = null }) => {
	const [activeTab, setActiveTab] = useState('body');
	const tabs = [{ name: 'body', label: 'Body' }, { name: 'headers', label: 'Headers' }, { name: 'metrics', label: '⚡ Metrics' }];

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<Box width={8}><Text color={theme.colors.primary}>STATUS:</Text></Box>
				<Text color={getStatusColor(response.status, theme)} bold>{response.status} {response.statustext}</Text>
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
							<JsonSyntaxHighlight jsonString={response.body} theme={theme} />
						</Box>
					</ScrollableBox>
				)}
				{activeTab === 'metrics' && (
					<ScrollableBox>
						<MetricsPanel metrics={metrics} theme={theme} />
					</ScrollableBox>
				)}
			</Box>
		</Box>
	);
});

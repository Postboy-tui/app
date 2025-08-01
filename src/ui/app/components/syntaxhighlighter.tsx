import { Box, Text } from "ink";
import React from "react";
import type { Theme, ThemeColors } from "../../../types";

export const JsonSyntaxHighlight = React.memo<{ jsonString: string; theme: Theme }>(({ jsonString, theme }) => {
	try {
		const json = JSON.parse(jsonString);
		const prettyJson = JSON.stringify(json, null, 2);

		return (
			<Box flexDirection="column">
				{prettyJson.split('\n').map((line, i) => {
					const indent = line.match(/^\s*/)?.[0] || '';
					const trimmedLine = line.trim();
					const keyMatch = trimmedLine.match(/^"([^"]+)"\s*:\s*(.*)/);

					if (keyMatch) {
						const key = keyMatch[1] || '';
						const valueString = (keyMatch[2] || '').replace(/,$/, '');
						const hasComma = (keyMatch[2] || '').endsWith(',');

						let valueNode;
						if (valueString.startsWith('"')) {
							valueNode = <Text color={theme.colors.success}>{valueString}</Text>;
						} else if (valueString === 'true' || valueString === 'false') {
							valueNode = <Text color={theme.colors.accent}>{valueString}</Text>;
						} else if (valueString === 'null') {
							valueNode = <Text color={theme.colors.muted}>{valueString}</Text>;
						} else if (['{', '['].includes(valueString)) {
							valueNode = <Text color={theme.colors.muted}>{valueString}</Text>;
						} else {
							valueNode = <Text color={theme.colors.secondary}>{valueString}</Text>;
						}

						return (
							<Text key={i}>
								<Text>{indent}</Text>
								<Text color={theme.colors.primary}>"{key}"</Text>
								<Text>: </Text>
								{valueNode}
								{hasComma && <Text>,</Text>}
							</Text>
						);
					}

					let color: keyof ThemeColors = 'white';
					const value = trimmedLine.replace(/,$/, '');
					const hasComma = trimmedLine.endsWith(',');

					if (value.startsWith('"')) color = 'success';
					else if (value === 'true' || value === 'false') color = 'accent';
					else if (value === 'null') color = 'muted';
					else if (['{', '}', '[', ']'].includes(value)) color = 'muted';
					else if (!isNaN(Number(value))) color = 'secondary';

					return (
						<Text key={i}>
							<Text>{indent}</Text>
							<Text color={theme.colors[color]}>{value}</Text>
							{hasComma && <Text>,</Text>}
						</Text>
					);
				})}
			</Box>
		);
	} catch (e) {
		return <Text color={theme.colors.error}>{jsonString}</Text>;
	}
});



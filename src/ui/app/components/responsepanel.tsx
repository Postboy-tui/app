import { Box, Text } from "ink";
import { ScrollableBox } from "./scrollablebox";
import { JsonSyntaxHighlight } from "./syntaxhighlighter";
import React from "react";
import { getStatusColor } from "../../../utils/colors";
import type { Theme } from "../../../types";

export const ResponsePanel = React.memo<{ response: { statustext: string; status: string; headers: string; body: string; error: string; }; theme: Theme }>(({ response, theme }) => (
	<ScrollableBox>
		<Box flexDirection="column" gap={1}>
			<Box><Box width={8}><Text color={theme.colors.primary}>STATUS:</Text></Box><Text color={getStatusColor(response.status, theme)} bold>{response.status} {response.statustext}</Text></Box>
			<Box><Box width={8}><Text color={theme.colors.primary}>HEADERS:</Text></Box>
				<Box flexDirection="column">
					{Object.entries(JSON.parse(response.headers || '{}')).map(([key, value]) => (
						<Text key={key}><Text color={theme.colors.accent}>{key}</Text><Text color={theme.colors.muted}>: </Text><Text color={theme.colors.success}>{String(value)}</Text></Text>
					))}
				</Box>
			</Box>
			<Box><Box width={8}><Text color={theme.colors.primary}>PAYLOAD:</Text></Box>
				<Box flexDirection="column" flexGrow={1}>
					<JsonSyntaxHighlight jsonString={response.body} theme={theme} />
				</Box>
			</Box>
		</Box>
	</ScrollableBox>
));

import { Text } from "ink";
import { useEffect, useState } from "react";
import type { ThemeColors } from "../../../types";

export const Spinner: React.FC<{ theme: ThemeColors }> = ({ theme }) => {
	const [frame, setFrame] = useState(0);
	const frames = ['▖', '▘', '▝', '▗'];
	useEffect(() => {
		const interval = setInterval(() => setFrame(f => (f + 1) % frames.length), 80);
		return () => clearInterval(interval);
	}, []);
	return <Text color={theme.accent}>{frames[frame]}</Text>;
};

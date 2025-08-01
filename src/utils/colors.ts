import type { Theme } from "../types";

export const getStatusColor = (status: string, theme: Theme) => {
	if (status.startsWith('2')) return theme.colors.success;
	if (status.startsWith('4')) return theme.colors.error;
	if (status.startsWith('5')) return theme.colors.error;
	return theme.colors.accent;
};

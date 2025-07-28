import type { ThemeColors } from "../types";

export const getStatusColor = (status: string, theme: ThemeColors) => {
  if (status.startsWith('2')) return theme.success;
  if (status.startsWith('4')) return theme.error;
  if (status.startsWith('5')) return theme.error;
  return theme.accent;
};

import { Box, Text, useInput, useStdout } from "ink";
import React, { useEffect, useState, type ReactNode } from "react";

export const ScrollableBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stdout } = useStdout();
  const [scrollPosition, setScrollPosition] = useState(0);
  const maxHeight = stdout.rows - 4;
  const [contentHeight, setContentHeight] = useState(0);

  useInput((_, key) => {
    if (key.pageUp) setScrollPosition(prev => Math.max(0, prev - maxHeight));
    if (key.pageDown) setScrollPosition(prev => Math.min(contentHeight - maxHeight, prev + maxHeight));
  });

  useEffect(() => {
    const estimateHeight = (node: React.ReactNode): number => {
      if (!node) return 0;
      if (typeof node === 'string') return node.split('\n').length;
      if (Array.isArray(node)) return node.reduce((acc, child) => acc + estimateHeight(child), 0);
      if (React.isValidElement(node)) return estimateHeight((node.props as { children?: ReactNode }).children);
      return 1;
    };
    setContentHeight(estimateHeight(children));
  }, [children]);

  return (
    <Box flexDirection="column" height={maxHeight} flexGrow={1}>
      <Box flexGrow={1} flexDirection="column">
        <Box marginTop={-scrollPosition} flexDirection="column">
          {React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>) : child)}
        </Box>
      </Box>
      {contentHeight > maxHeight && (
        <Box justifyContent="center">
          <Text color="gray">{`Scroll (PgUp/PgDn) ${scrollPosition + 1}-${Math.min(scrollPosition + maxHeight, contentHeight)}/${contentHeight}`}</Text>
        </Box>
      )}
    </Box>
  );
};

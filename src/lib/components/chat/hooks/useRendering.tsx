import React, { useCallback, useRef, type ComponentType, type ReactNode } from 'react';
import type { AutoUIConfig } from '@lib/types';

export function useRendering(config: AutoUIConfig) {
  const uiRendererRef = useRef<null | ((node: ReactNode | string | ComponentType<any>) => void)>(null);

  const setUIRenderer = useCallback((fn: (node: ReactNode | string | ComponentType<any>) => void) => {
    uiRendererRef.current = fn;
  }, []);

  const resolveComponent = useCallback(
    (name: string, props: any): ReactNode => {
      const entry = config?.components?.[name];
      if (!entry?.callComponent) return;
      const Comp = entry.callComponent as React.ComponentType<any>;
      const mergedProps = { ...entry.defaults, ...props };
      return <Comp {...mergedProps} />;
    },
    [config?.components],
  );

  const setUI = useCallback((ui: React.ReactNode | string) => {
    uiRendererRef.current?.(ui);
  }, []);
  return { setUIRenderer, resolveComponent, setUI };
}

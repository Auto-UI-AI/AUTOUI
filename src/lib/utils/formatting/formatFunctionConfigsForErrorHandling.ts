import type { AutoUIConfig } from '@lib/types';

export function formatFunctionConfigsForErrorHandling(
  functionNames: Set<string>,
  functionConfigs: string[],
  config: AutoUIConfig,
): void {
  functionNames.forEach(name => {
    const funcConfig = config.functions[name];
    if (funcConfig) {
      const params = funcConfig.params
        ? Object.entries(funcConfig.params).map(([k, v]) => `    ${k}: ${v}`).join('\n')
        : '    (no params)';
      
      const canShareNote = funcConfig.canShareDataWithLLM
        ? '\n  [Can share data with LLM - set hasToShareDataWithLLM based on user intent]'
        : '';
      
      functionConfigs.push(`${name}:\n  ${funcConfig.prompt}\n  Params:\n${params}${canShareNote}`);
    }
  });
}


import type { AutoUIConfig } from "@lib/types";

export const formatFuncsForPrompt = (config: AutoUIConfig) => {
    return Object.entries(config.functions).map(([name, f]) => {
        const params = f.params
          ? Object.entries(f.params).map(([k, v]) => `  ${k}: ${v}`).join('\n')
          : '  (no params)';
        
        const canShareNote = f.canShareDataWithLLM
          ? '\n  [Can share data with LLM - set hasToShareDataWithLLM based on user intent]'
          : '';
        
        return `${name}:
      ${f.prompt}
      Params:
    ${params}${canShareNote}`;
      });
}
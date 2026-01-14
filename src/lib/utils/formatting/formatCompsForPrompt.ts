import type { AutoUIConfig } from "@lib/types";

export const formatCompsForPrompt = (config: AutoUIConfig) => {
    return Object.entries(config.components).map(([name, c]) => {
        const props = c.props
          ? Object.entries(c.props).map(([k, v]) => `  ${k}: ${v}`).join('\n')
          : '  (no props)';
        
        const callbacks = c.callbacks
          ? Object.entries(c.callbacks).map(([callbackName, callback]) => {
              const callbackDef: { description: string; whenToUse?: string; example?: string } = typeof callback === 'function' 
                ? { description: 'Callback handler' }
                : callback;
              const whenToUse = callbackDef.whenToUse ? `\n    When to use: ${callbackDef.whenToUse}` : '';
              const example = callbackDef.example ? `\n    Example: ${callbackDef.example}` : '';
              return `  ${callbackName}: ${callbackDef.description}${whenToUse}${example}`;
            }).join('\n')
          : '  (no callbacks)';
        
        return `${name}:
      ${c.prompt}
      Props:
    ${props}
      Available Callbacks:
    ${callbacks}`;
      });
}
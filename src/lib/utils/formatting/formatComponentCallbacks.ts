import type { AutoUIConfig } from "@lib/types";

export const formatComponentCallbacks = async (planComponentNames:Set<string>, componentConfigs:string[], config:AutoUIConfig) =>{
    planComponentNames.forEach(name => {
    const compConfig = config.components[name];
    if (compConfig) {
      const callbacks = compConfig.callbacks
        ? Object.entries(compConfig.callbacks).map(([callbackName, callback]) => {
            if (typeof callback === 'function') {
              return `    ${callbackName}: Callback handler`;
            }
            const callbackDef = callback;
            const whenToUse = 'whenToUse' in callbackDef && callbackDef.whenToUse ? `\n      When to use: ${callbackDef.whenToUse}` : '';
            const example = 'example' in callbackDef && callbackDef.example ? `\n      Example: ${callbackDef.example}` : '';
            return `    ${callbackName}: ${callbackDef.description}${whenToUse}${example}`;
          }).join('\n')
        : '    (no callbacks)';
      componentConfigs.push(`${name}:\n  ${compConfig.prompt}\n  Available Callbacks:\n${callbacks}`);
    }
  });
}
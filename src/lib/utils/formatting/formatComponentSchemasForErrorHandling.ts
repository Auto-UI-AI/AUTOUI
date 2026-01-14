import type { AutoUIConfig } from '@lib/types';
import type { AutoUIAppSchema } from '@lib/build-time/typeSchemaPlugin';

export function formatComponentSchemasForErrorHandling(
  componentNames: Set<string>,
  config: AutoUIConfig,
  runtimeSchema: AutoUIAppSchema | null,
): string[] {
  const schemaInfo: string[] = [];

  if (!runtimeSchema) {
    return schemaInfo;
  }

  componentNames.forEach(compName => {
    const schemaComp = runtimeSchema.components[compName];
    const compConfig = config.components[compName];
    
    if (schemaComp) {
      const requiredProps = Object.entries(schemaComp.props)
        .filter(([_, ref]) => ref.required)
        .map(([k, ref]) => `${k} (${ref.type})`);
      
      const optionalProps = Object.entries(schemaComp.props)
        .filter(([_, ref]) => !ref.required)
        .map(([k, ref]) => `${k} (${ref.type})`);
      
      let compSchema = `COMPONENT "${compName}":`;
      if (requiredProps.length > 0) {
        compSchema += `\n  REQUIRED PROPS: ${requiredProps.join(', ')}`;
      }
      if (optionalProps.length > 0) {
        compSchema += `\n  OPTIONAL PROPS: ${optionalProps.join(', ')}`;
      }
      
      if (compConfig?.callbacks) {
        const callbackNames = Object.keys(compConfig.callbacks);
        if (callbackNames.length > 0) {
          compSchema += `\n  AVAILABLE CALLBACKS: ${callbackNames.join(', ')}`;
          const callbackDetails = Object.entries(compConfig.callbacks)
            .map(([name, callback]) => {
              if (typeof callback === 'function') {
                return `    ${name}: Callback handler`;
              }
              const def = callback;
              const whenToUse = 'whenToUse' in def && def.whenToUse ? ` (use when: ${def.whenToUse})` : '';
              return `    ${name}: ${def.description}${whenToUse}`;
            })
            .join('\n');
          compSchema += `\n  Callback Details:\n${callbackDetails}`;
        }
      }
      
      schemaInfo.push(compSchema);
    }
  });

  return schemaInfo;
}


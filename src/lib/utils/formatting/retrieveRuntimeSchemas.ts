import type { AutoUIConfig } from '@lib/types';

export const retrieveRuntimeSchemasForPrompt = async ( componentNames: Set<string>, functionNames: Set<string>, config: AutoUIConfig) => {
    let schemaInfo = '';
    if (componentNames.size > 0 || functionNames.size > 0) {
        
        const { getRuntimeSchemaAsync } = await import('@lib/utils/validation/runtimeSchemaValidator');
        const runtimeSchema = await getRuntimeSchemaAsync(config);
        
        if (runtimeSchema) {
          const schemaParts: string[] = [];
          
          if (componentNames.size > 0) {
            componentNames.forEach(compName => {
              const compSchema = runtimeSchema.components[compName];
              const compConfig = config.components[compName];
              
              if (compSchema) {
                const requiredProps = Object.entries(compSchema.props)
                  .filter(([_, ref]) => ref.required)
                  .map(([k, ref]) => `${k} (${ref.type}${ref.required ? ', required' : ''})`);
                
                const optionalProps = Object.entries(compSchema.props)
                  .filter(([_, ref]) => !ref.required)
                  .map(([k, ref]) => `${k} (${ref.type}, optional)`);
                
                let compInfo = `COMPONENT "${compName}":`;
                if (requiredProps.length > 0) {
                  compInfo += `\n  REQUIRED PROPS: ${requiredProps.join(', ')}`;
                }
                if (optionalProps.length > 0) {
                  compInfo += `\n  OPTIONAL PROPS: ${optionalProps.join(', ')}`;
                }
                
                if (compConfig?.callbacks) {
                  const callbackNames = Object.keys(compConfig.callbacks);
                  if (callbackNames.length > 0) {
                    compInfo += `\n  AVAILABLE CALLBACKS: ${callbackNames.join(', ')}`;
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
                    compInfo += `\n  Callback Details:\n${callbackDetails}`;
                  }
                }
                
                schemaParts.push(compInfo);
              }
            });
          }
          
          if (functionNames.size > 0) {
            functionNames.forEach(funcName => {
              const funcSchema = runtimeSchema.functions[funcName];
              if (funcSchema) {
                const requiredParams = Object.entries(funcSchema.params)
                  .filter(([_, ref]) => ref.required)
                  .map(([k, ref]) => `${k} (${ref.type}${ref.required ? ', required' : ''})`);
                
                const optionalParams = Object.entries(funcSchema.params)
                  .filter(([_, ref]) => !ref.required)
                  .map(([k, ref]) => `${k} (${ref.type}, optional)`);
                
                let funcInfo = `FUNCTION "${funcName}":`;
                if (requiredParams.length > 0) {
                  funcInfo += `\n  REQUIRED PARAMS: ${requiredParams.join(', ')}`;
                }
                if (optionalParams.length > 0) {
                  funcInfo += `\n  OPTIONAL PARAMS: ${optionalParams.join(', ')}`;
                }
                funcInfo += `\n  RETURNS: ${funcSchema.returns.type}`;
                schemaParts.push(funcInfo);
              }
            });
          }
          
          if (schemaParts.length > 0) {
            schemaInfo = `\n\nAVAILABLE COMPONENTS/FUNCTIONS IN PLAN (use ONLY these props/params):\n${schemaParts.join('\n\n')}\n`;
          }
        }
      }
    return schemaInfo;
}
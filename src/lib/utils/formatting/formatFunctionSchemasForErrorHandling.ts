import type { AutoUIAppSchema } from '@lib/build-time/typeSchemaPlugin';

export async function formatFunctionSchemasForErrorHandling(
  functionNames: Set<string>,
  runtimeSchema: AutoUIAppSchema | null,
): Promise<string[]> {
  const schemaInfo: string[] = [];

  if (!runtimeSchema) {
    return schemaInfo;
  }

  functionNames.forEach(funcName => {
    const schemaFunc = runtimeSchema.functions[funcName];
    if (schemaFunc) {
      const requiredParams = Object.entries(schemaFunc.params)
        .filter(([_, ref]) => ref.required)
        .map(([k, ref]) => `${k} (${ref.type})`);
      
      const optionalParams = Object.entries(schemaFunc.params)
        .filter(([_, ref]) => !ref.required)
        .map(([k, ref]) => `${k} (${ref.type})`);
      
      let funcSchema = `FUNCTION "${funcName}":`;
      if (requiredParams.length > 0) {
        funcSchema += `\n  REQUIRED PARAMS: ${requiredParams.join(', ')}`;
      }
      if (optionalParams.length > 0) {
        funcSchema += `\n  OPTIONAL PARAMS: ${optionalParams.join(', ')}`;
      }
      funcSchema += `\n  RETURNS: ${schemaFunc.returns.type}`;
      schemaInfo.push(funcSchema);
    }
  });

  return schemaInfo;
}


import type { AutoUIConfig } from '@lib/types';
import type { ValidationSchemas } from '@lib/utils/validation/schemaValidator';
import {
  getRuntimeSchemaAsync,
  getValidationSchemaRuntime,
  validateComponentPropsRuntime,
  validateFunctionParamsRuntime,
} from '@lib/utils/validation/runtimeSchemaValidator';

export async function getValidationSchema(
  config: AutoUIConfig,
  functionName?: string,
  componentName?: string,
): Promise<ValidationSchemas | null> {
  try { 
    const runtimeSchema = await getRuntimeSchemaAsync(config);
    if (!runtimeSchema) {
      console.warn(`⚠️ [Validation] Runtime schema not found. Make sure .autoui-runtime-schema.json is generated and accessible.`);
      console.warn(`   The schema is generated at build-time by the AutoUI plugin.`);
      console.warn(`   Check that the plugin is configured and the schema file exists.`);
      return null;
    }

    console.log(`💾 [Validation] Using runtime schema (client-side validation, no backend needed)`);
    const runtimeSchemas = await getValidationSchemaRuntime(config, functionName, componentName);
    if (runtimeSchemas) {
      return {
        components: runtimeSchemas.components.map((c) => ({
          name: c.name,
          props: Object.fromEntries(
            Object.entries(c.props).map(([key, ref]) => [
              key,
              {
                type: 'object' as const, 
                optional: !ref.required,
              },
            ]),
          ),
        })),
        functions: runtimeSchemas.functions.map((f) => ({
          name: f.name,
          params: Object.fromEntries(
            Object.entries(f.params).map(([key, ref]) => [
              key,
              {
                type: 'object' as const, 
                optional: !ref.required,
              },
            ]),
          ),
          returns: {
            type: 'object' as const, 
          },
        })),
      };
    }

    return null;
  } catch (error) {
    console.warn('⚠️ [Validation] Error getting validation schema:', error);
    return null;
  }
}
  
export async function validateComponentPropsWithRuntime(
  componentName: string,
  props: Record<string, any>,
  config: AutoUIConfig,
): Promise<string[]> {
  const runtimeSchema = await getRuntimeSchemaAsync(config);
  if (runtimeSchema) {
    return validateComponentPropsRuntime(componentName, props, runtimeSchema);
  }
  
  console.warn(`⚠️ [Validation] Runtime schema not available. Make sure .autoui-runtime-schema.json is generated.`);
  return [];
}

export async function validateFunctionParamsWithRuntime(
  functionName: string,
  params: Record<string, any>,
  config: AutoUIConfig,
): Promise<string[]> {
  const runtimeSchema = await getRuntimeSchemaAsync(config);
  if (runtimeSchema) {
    return validateFunctionParamsRuntime(functionName, params, runtimeSchema);
  }
  
  console.warn(`⚠️ [Validation] Runtime schema not available. Make sure .autoui-runtime-schema.json is generated.`);
  return [];
}


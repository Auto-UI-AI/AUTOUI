import type { AutoUIConfig } from "@lib/types";
import type { InstructionStep } from "@lib/types/llmTypes";

export function stepConsumesAssign(
  step: InstructionStep | undefined,
  assignKey: string
): boolean {
  if (!step) return false;

  if (step.type === 'component') {
    return JSON.stringify(step.props ?? {}).includes(`{{${assignKey}}}`);
  }

  if (step.type === 'function') {
    return (
      JSON.stringify((step as any).params ?? {}).includes(`{{${assignKey}}}`) ||
      JSON.stringify((step as any).args ?? []).includes(`{{${assignKey}}}`)
    );
  }

  return false;
}

export function getExpectedSchemaForStep(
  step: InstructionStep | undefined,
  config: AutoUIConfig
): { parseTo: 'array' | 'object' | 'primitive'; schema: unknown } | null {
  if (!step) return null;

  if (step.type === 'component') {
    const comp = config.components[step.name];
    if (!comp?.props) return null;

    return {
      parseTo: 'object',
      schema: comp.props,
    };
  }

  if (step.type === 'function') {
    const fn = config.functions[step.name];
    if (!fn?.params) return null;

    return {
      parseTo: 'object',
      schema: fn.params,
    };
  }

  return null;
}

export async function getExpectedSchemaForAssignKey(
  assignKey: string,
  remainingSteps: InstructionStep[],
  config: AutoUIConfig
): Promise<{ parseTo: 'array' | 'object' | 'primitive'; schema: unknown; paramName?: string } | null> {
  for (const step of remainingSteps) {
    if (stepConsumesAssign(step, assignKey)) {
      let paramName: string | undefined;
      
      if (step.type === 'function') {
        const params = (step as any).params ?? {};
        paramName = Object.keys(params).find(key => {
          const value = params[key];
          return typeof value === 'string' && value.includes(`{{${assignKey}}}`);
        });
      } else if (step.type === 'component') {
        const props = step.props ?? {};
        paramName = Object.keys(props).find(key => {
          const value = props[key];
          return typeof value === 'string' && value.includes(`{{${assignKey}}}`);
        });
      }
      
      const runtimeSchemaModule = await import('./runtimeSchemaValidator');
      const runtimeSchema = await runtimeSchemaModule.getRuntimeSchemaAsync(config);
      
      if (runtimeSchema && paramName) {
        if (step.type === 'function') {
          const funcSchema = runtimeSchema.functions[step.name];
          if (funcSchema && funcSchema.params[paramName]) {
            const paramRef = funcSchema.params[paramName];
            const typeDef = runtimeSchemaModule.resolveType(paramRef.type, runtimeSchema);
            
            if (typeDef) {
              let parseTo: 'array' | 'object' | 'primitive' = 'primitive';
              if (typeDef.type === 'array') {
                parseTo = 'array';
              } else if (typeDef.type === 'object') {
                parseTo = 'object';
              }
              
              return {
                parseTo,
                schema: typeDef,
                paramName,
              };
            }
          }
        } else if (step.type === 'component') {
          const compSchema = runtimeSchema.components[step.name];
          if (compSchema && compSchema.props[paramName]) {
            const propRef = compSchema.props[paramName];
            const typeDef = runtimeSchemaModule.resolveType(propRef.type, runtimeSchema);
            
            if (typeDef) {
              let parseTo: 'array' | 'object' | 'primitive' = 'primitive';
              if (typeDef.type === 'array') {
                parseTo = 'array';
              } else if (typeDef.type === 'object') {
                parseTo = 'object';
              }
              
              return {
                parseTo,
                schema: typeDef,
                paramName,
              };
            }
          }
        }
      }
          
      return getExpectedSchemaForStep(step, config);
    }
  }
  
  return null;
}
export function getConsumerKeysForAssign(
  step: InstructionStep | undefined,
  assignKey: string
): string[] {
  if (!step || step.type !== 'component') return [];

  const props = step.props ?? {};
  return Object.entries(props)
    .filter(([, v]) => typeof v === 'string' && v.includes(`{{${assignKey}}}`))
    .map(([k]) => k);
}
export function normalizeForCtx(
  analyzed: any,
  consumerKeys: string[]
) {
  if (
    consumerKeys.length === 1 &&
    analyzed &&
    typeof analyzed === 'object' &&
    !Array.isArray(analyzed) &&
    consumerKeys[0] in analyzed
  ) {
    return analyzed[consumerKeys[0]];
  }

  return analyzed;
}

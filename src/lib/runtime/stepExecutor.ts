import type { InstructionPlan, InstructionStep, ComponentStep } from '@lib/types/llmTypes';
import type { AutoUIConfig } from '../types';
import { resolveProps } from '../utils/formatting/resolveProps';
import type { SerializedMessage } from '@lib/components/chat/types';
import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';
import { updateSerializedMessages } from './updateSerializedMessages';
import { invokeFunction } from './invokeFunction';
import { analyzeDataStep } from './analyzeDataStep';
import { getValidationSchema } from './validation';
import { validateFunctionParams, validateComponentProps } from '../utils/validation/schemaValidator';
import type { FunctionSchema, ComponentSchema } from '../utils/validation/schemaValidator';
import { errorHandlingWithLLM } from '../core/errorHandling/errorHandlingWithLLM';
import type { StepExecutionError, ErrorHandlingResponse } from '@lib/types/errorHandlingTypes';

export type ResolveComponent = (name: string, props: any) => React.ReactNode;
export type SetUI = (ui: React.ReactNode | string) => void;

export async function executePlanSteps(
  plan: InstructionPlan,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
  userMessage: string,
  prevMessagesForContext: string,
  contextVars?: Record<string, any>,
  retryCount: number = 0,
  fallbackSuggestion?: string,
) {
  console.log("Running instruction plan:", plan, "userMessage: ",userMessage);
  const ctx: Record<string, any> = contextVars ?? {};
  console.log("📦 [ExecutePlanSteps] Context vars:", Object.keys(ctx), "Values:", ctx);
  
  const executedSteps: InstructionStep[] = [];
  const MAX_RETRIES = 2;
  
  for (let stepIndex = 0; stepIndex < plan.steps.length; stepIndex++) {
    const step = plan.steps[stepIndex];
    
    try {
      const result = await runStep(
        step,
        ctx,
        config,
        resolveComponent,
        setUI,
        setSerializedMessages,
        userMessage,
        prevMessagesForContext,
        plan,
        stepIndex,
      );
      
      executedSteps.push(step);
      
      if (result) break;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [Step Execution] Step ${stepIndex + 1} failed:`, errorMessage);
      
      const shouldRetry = config.runtime?.errorHandling?.retryOnFail ?? false;
      const showToUser = config.runtime?.errorHandling?.showToUser ?? true;
      
      if (shouldRetry && retryCount < MAX_RETRIES) {
        let errorType: 'validation' | 'runtime' | 'component_render' = 'validation';
        if (errorMessage.includes('failed to render')) {
          errorType = 'component_render';
        } else if (errorMessage.includes('validation failed')) {
          errorType = 'validation';
        } else {
          errorType = 'runtime';
        }
        
        const stepError: StepExecutionError = {
          step,
          stepIndex,
          errorType,
          errors: [errorMessage],
          context: { ...ctx },
        };
        
        if (step.type === 'component' && 'props' in step) {
          stepError.props = step.props as Record<string, any>;
        }

        let errorResponse: ErrorHandlingResponse | null = null;
        try {
          errorResponse = await errorHandlingWithLLM(
            {
              userMessage,
              prevMessagesForContext,
              plan,
              executedSteps,
              failedStep: stepError,
            },
            ctx,
            config,
          );
          
          if (errorResponse) {
            const response = errorResponse; 
            if (response.shouldRetry && response.newInstructionPlan) {
              console.log(`🔄 [Error Recovery] Retrying with modified plan (attempt ${retryCount + 1}/${MAX_RETRIES})`);
              if (response.modifiedContext) {
                Object.assign(ctx, response.modifiedContext);
              }
              try {
                return await executePlanSteps(
                  response.newInstructionPlan,
                  config,
                  resolveComponent,
                  setUI,
                  setSerializedMessages,
                  userMessage,
                  prevMessagesForContext,
                  ctx,
                  retryCount + 1,
                  response.fallbackSuggestion, 
                );
              } catch (retryError) {
                if (response.fallbackSuggestion && showToUser) {
                  console.log(`⚠️ [Error Recovery] Retry failed, using fallback suggestion`);
                  setSerializedMessages((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-error-fallback`,
                      role: 'assistant',
                      kind: 'text',
                      text: response.fallbackSuggestion!,
                    },
                  ]);
                  setUI(response.fallbackSuggestion);
                  return ctx;
                }
                throw retryError;
              }
            } else if (response.errorMessage && showToUser) {
              setSerializedMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-error`,
                  role: 'assistant',
                  kind: 'text',
                  text: response.errorMessage!,
                },
              ]);
              setUI(response.errorMessage);
              return ctx;
            }
          }
        } catch (errorHandlingError) {
          console.error('Error handling API failed:', errorHandlingError);
        }
        
        if (errorResponse && errorResponse.errorMessage && showToUser) {
          setSerializedMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-error`,
              role: 'assistant',
              kind: 'text',
              text: errorResponse.errorMessage!,
            },
          ]);
          setUI(errorResponse.errorMessage);
          return ctx;
        }
      }
      
      if (showToUser) {
        const fallbackMessage = fallbackSuggestion || `I couldn't complete that action. Could you try rephrasing your request or providing more details?`;
        setSerializedMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            role: 'assistant',
            kind: 'text',
            text: fallbackMessage,
          },
        ]);
        setUI(fallbackMessage);
      }
      
      return ctx;
    }
  }
  return ctx;
}


async function runStep(
  step: InstructionStep,
  ctx: Record<string, any>,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
  userMessage: string,
  prevMessagesForContext: string,
  plan: InstructionPlan,
  _stepIndex: number,
) {
 
  if (step.type === 'function') {
    const fCfg = config.functions[step.name];
    if (!fCfg) throw new Error(`Unknown function: ${step.name}`);

    const anyStep = step as any;
    let stepParams: Record<string, any> = {};
    
    if (anyStep.params && typeof anyStep.params === 'object' && !Array.isArray(anyStep.params)) {
      stepParams = anyStep.params;
    } else if (Array.isArray(anyStep.args) && anyStep.args.length === 1 && typeof anyStep.args[0] === 'object') {
      stepParams = anyStep.args[0];
    }
    
    stepParams = resolveProps(stepParams, ctx, config);
    console.log(`🔧 [ResolveProps] Function params after resolution:`, stepParams);
    
    (step as any).params = stepParams;
    
    const { getRuntimeSchemaAsync, validateFunctionParamsRuntime } = await import('@lib/utils/validation/runtimeSchemaValidator');
    const runtimeSchema = await getRuntimeSchemaAsync(config);
    if (runtimeSchema) {
      console.log(`🔎 [Runtime Validation] Validating function "${step.name}" params...`);
      const runtimeErrors = validateFunctionParamsRuntime(step.name, stepParams, runtimeSchema);
      if (runtimeErrors.length > 0) {
        console.warn(`⚠️ [Runtime Validation] Function ${step.name} parameter validation errors:`, runtimeErrors);
      }
    } else {
      console.log(`🔎 [Validation] Checking for validation schema for function: "${step.name}"`);
      const schemas = await getValidationSchema(config, step.name);
      if (schemas) {
        const functionSchema = schemas.functions.find((f: FunctionSchema) => f.name === step.name);
        if (functionSchema) {
          console.log(`✅ [Validation] Found schema for function "${step.name}", validating parameters...`);
          const errors = validateFunctionParams(stepParams, functionSchema);
          
          if (errors.length > 0) {
            console.warn(`⚠️ [Validation] Function ${step.name} parameter validation errors:`, errors);
          }
        }
      }
    }

    let out = await invokeFunction(fCfg, step);
    
    const shouldAnalyze = fCfg.canShareDataWithLLM && step.hasToShareDataWithLLM;
    
    if (shouldAnalyze) {
      console.log(`🔍 [Extra Analysis] Function "${step.name}" returned data, starting LLM analysis...`);
      const assignKey = (step as any).assign;
      const currentIndex = plan.steps.indexOf(step);
      const nextStep = plan.steps[currentIndex + 1];

      const analysisResult = await analyzeDataStep(config, out, assignKey, step, currentIndex, nextStep, userMessage, prevMessagesForContext, ctx, plan, resolveComponent, setUI, setSerializedMessages);
      console.log(`✅ [Extra Analysis] Analysis complete, result:`, analysisResult);
      return analysisResult;
    } else {
      if ((step as any).assign) {
        ctx[(step as any).assign] = out;
        console.log(`📦 [Context] Stored function output in context key: "${(step as any).assign}"`);
      }
      if (!fCfg.canShareDataWithLLM) {
        console.log(`ℹ️ [Extra Analysis] Skipped - function "${step.name}" has canShareDataWithLLM=false`);
      } else if (!step.hasToShareDataWithLLM) {
        console.log(`ℹ️ [Extra Analysis] Skipped - step has hasToShareDataWithLLM=false`);
      }
      return false;
    }
  }
  if (step.type === 'component') {
    const componentConfig = config.components[step.name];
    const componentStep = step as ComponentStep;
    
    let propsToResolve = { ...(step.props ?? {}) };
    if (componentStep.callbacks) {
      console.log(`🔗 [ComponentStep] Merging explicit callbacks:`, componentStep.callbacks);
      Object.assign(propsToResolve, componentStep.callbacks);
    }
    
    console.log(`🔧 [ResolveProps] Before resolution - step.props:`, step.props, `callbacks:`, componentStep.callbacks, `ctx:`, ctx);
    let props = resolveProps(propsToResolve, ctx, config, componentConfig);
    console.log(`🔧 [ResolveProps] After resolution - props:`, props);
    
    const { getRuntimeSchemaAsync, validateComponentPropsRuntime, parseJsonStringsInProps } = await import('@lib/utils/validation/runtimeSchemaValidator');
    const runtimeSchema = await getRuntimeSchemaAsync(config);
    if (runtimeSchema) {
      console.log(`🔎 [Runtime Validation] Validating component "${step.name}" props...`);
      const parseResult = parseJsonStringsInProps(props, step.name, runtimeSchema);
      props = parseResult.props;
      
      if (parseResult.warnings.length > 0) {
        parseResult.warnings.forEach((warning: string) => console.warn(`⚠️ [Parse Props] ${warning}`));
      }
      
      if (parseResult.errors.length > 0) {
        console.error(`\n❌ [Parse Props] Found ${parseResult.errors.length} error(s) while parsing props for component "${step.name}":`);
        parseResult.errors.forEach((error, index: number) => {
          console.error(`\n  Error ${index + 1}: ${error.message}`);
          console.error(`    Prop: "${error.propName}"`);
          console.error(`    Expected Type: ${error.expectedType}`);
          console.error(`    Received Value: ${typeof error.receivedValue === 'string' && error.receivedValue.length > 100 
            ? `"${error.receivedValue.substring(0, 100)}..." (${error.receivedValue.length} chars)` 
            : JSON.stringify(error.receivedValue)}`);
          if (error.suggestion) {
            console.error(`    💡 Suggestion: ${error.suggestion}`);
          }
        });
      } 
      
      const runtimeErrors = validateComponentPropsRuntime(step.name, props, runtimeSchema);
      
      const allErrors = [
        ...parseResult.errors.map((e) => e.message),
        ...runtimeErrors,
      ];
      
      if (allErrors.length > 0) {
        console.error(`\n❌ [Component Props] Component "${step.name}" has ${allErrors.length} total error(s):`);
        allErrors.forEach((error: string, index: number) => {
          console.error(`  ${index + 1}. ${error}`);
        });
        
        const hasCriticalErrors = parseResult.errors.some((e) => 
          e.errorType === 'type_mismatch' || e.errorType === 'parsing_failed'
        ) || runtimeErrors.length > 0;
        
        if (hasCriticalErrors) {
          console.error(`[Validation] Component "${step.name}" validation failed with errors:`, allErrors);
          const technicalError = `Component "${step.name}" validation failed: ${allErrors.join('; ')}`;
          throw new Error(technicalError);
        }
      }
    } else {
      console.log(`🔎 [Validation] Checking for validation schema for component: "${step.name}"`);
      const schemas = await getValidationSchema(config, undefined, step.name);
      if (schemas) {
        const componentSchema = schemas.components.find((c: ComponentSchema) => c.name === step.name);
        if (componentSchema) {
          console.log(`✅ [Validation] Found schema for component "${step.name}", validating props...`);
          const errors = validateComponentProps(props, componentSchema);
          
          if (errors.length > 0) {
            console.warn(`⚠️ [Validation] Component ${step.name} prop validation errors:`, errors);
          }
        }
      }
    }
    
    try {
      const node = resolveComponent(step.name, props);
      setUI(node);
      updateSerializedMessages(setSerializedMessages, props, step);
    } catch (renderError) {
      const technicalError = `Component "${step.name}" failed to render: ${renderError instanceof Error ? renderError.message : String(renderError)}`;
      console.error(`[Component Render] Technical error:`, technicalError);
      throw new Error(technicalError);
    }
    return false;
  }

  if (step.type === 'text') {
    const s = step as unknown as { type: 'text'; text: string };
    setSerializedMessages((prev) => {
      return [...prev, { id: `${Date.now()}-a`, role: 'assistant', kind: 'text', text: s.text }];
    });
    setUI(s.text ?? '');
    return false;
  }

  const result: never = step;
  return result;
}



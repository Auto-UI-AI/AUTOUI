import type { AutoUIConfig } from "@lib/types";
import type { FunctionStep, InstructionPlan, InstructionStep } from "@lib/types/llmTypes";
import { getConsumerKeysForAssign, getExpectedSchemaForStep, normalizeForCtx } from "@lib/utils/validation/normalizationHelpers";
import { executePlanSteps, type ResolveComponent, type SetUI } from "./stepExecutor";
import type { Dispatch, SetStateAction } from "react";
import type { SerializedMessage } from "@lib/components/chat/types";
import { extraAnalysisWithLLM } from "@lib/core/extraAnalysis/extraDataAnalyzingWithLLM";

export const analyzeDataStep = async (config:AutoUIConfig, out: any, assignKey: string, step:FunctionStep, currentIndex: number, nextStep: InstructionStep, userMessage: string, prevMessagesForContext: string, ctx: Record<string, any>, plan: InstructionPlan, resolveComponent: ResolveComponent, setUI: SetUI, setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>) =>{
    
    console.log(`🔍 [AnalyzeDataStep] Starting analysis for step "${step.name}" at index ${currentIndex}`);
    console.log(`🔍 [AnalyzeDataStep] Output data type:`, typeof out, Array.isArray(out) ? 'array' : 'object');
    console.log(`🔍 [AnalyzeDataStep] Assign key:`, assignKey);
    console.log(`🔍 [AnalyzeDataStep] Next step:`, nextStep?.type, nextStep?.type === 'component' || nextStep?.type === 'function' ? (nextStep as any).name : '');
    
    const remainingSteps = plan.steps.slice(currentIndex + 1);
    
    let expectedSchema: ReturnType<typeof getExpectedSchemaForStep> | null = null;
    
    if (assignKey && remainingSteps.length > 0) {
      const { getExpectedSchemaForAssignKey } = await import('@lib/utils/validation/normalizationHelpers');
      expectedSchema = await getExpectedSchemaForAssignKey(assignKey, remainingSteps, config);
      
      if (expectedSchema) {
        console.log(`📋 [AnalyzeDataStep] Expected schema found for assign key "${assignKey}":`, expectedSchema);
      } else {
        console.log(`ℹ️ [AnalyzeDataStep] No expected schema - no remaining steps consume assign key "${assignKey}"`);
      }
    } else {
      console.log(`ℹ️ [AnalyzeDataStep] No expected schema - no assign key or no remaining steps`);
    }
    
    try {
      console.log(`🚀 [AnalyzeDataStep] Calling extraAnalysisWithLLM...`);
      const analyzed = await extraAnalysisWithLLM(
        out,
        config,
        userMessage,
        prevMessagesForContext,
        plan,
        step,
        currentIndex,
        expectedSchema,
      );
      console.log(`✅ [AnalyzeDataStep] Received analysis result:`, {
        hasData: !!analyzed.data,
        hasNewPlan: !!analyzed.newInstructionPlan,
        parseTo: analyzed.parseTo
      });
      
      const consumerKeys = getConsumerKeysForAssign(nextStep, assignKey);

      const normalized = normalizeForCtx(analyzed.data, consumerKeys);
      
      console.log('Extra analysis data received from LLM:', analyzed);
      console.log('Normalized ctx value:', normalized);

      if (assignKey) {
        ctx[assignKey] = normalized;
      }
      if(analyzed.newInstructionPlan!=null && analyzed.newInstructionPlan!=''){
        console.log('analyzed.newInstructionPlan: ', analyzed.newInstructionPlan)
        
  
        if (assignKey) {
          const processedPlan = JSON.parse(JSON.stringify(analyzed.newInstructionPlan));
          if (processedPlan.steps) {
            processedPlan.steps.forEach((step: any) => {
              if (step.type === 'component' && step.props) {
                Object.keys(step.props).forEach(key => {
                  if (typeof step.props[key] === 'string' && step.props[key] === '{{data}}') {
                    step.props[key] = `{{${assignKey}}}`;
                  }
                });
              }
            });
          }
          executePlanSteps(processedPlan, config, resolveComponent, setUI, setSerializedMessages,userMessage,prevMessagesForContext, ctx)
        } else {
          executePlanSteps(analyzed.newInstructionPlan, config, resolveComponent, setUI, setSerializedMessages,userMessage,prevMessagesForContext, ctx)
        }
        return true
      }
      return false
    } catch (e) {
      console.error(e);
      return true
    }

}
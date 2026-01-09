import type { AutoUIConfig } from "@lib/types";
import type { FunctionStep, InstructionPlan, InstructionStep } from "@lib/types/llmTypes";
import { getConsumerKeysForAssign, getExpectedSchemaForStep, normalizeForCtx, stepConsumesAssign } from "@lib/utils/validation/normalizationHelpers";
import { executePlanSteps, type ResolveComponent, type SetUI } from "./stepExecutor";
import type { Dispatch, SetStateAction } from "react";
import type { SerializedMessage } from "@lib/components/chat/types";
import { extraAnalysisWithLLM } from "@lib/core/extraDataAnalyzingWithLLM";

export const analyzeDataStep = async (config:AutoUIConfig, out: any, assignKey: string, step:FunctionStep, currentIndex: number, nextStep: InstructionStep, userMessage: string, prevMessagesForContext: string, ctx: Record<string, any>, plan: InstructionPlan, resolveComponent: ResolveComponent, setUI: SetUI, setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>) =>{
    
    let expectedSchema: ReturnType<typeof getExpectedSchemaForStep> | null = null;

    if (assignKey && stepConsumesAssign(nextStep, assignKey)) {
      expectedSchema = getExpectedSchemaForStep(nextStep, config);
    }
    try {
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
      
      const consumerKeys = getConsumerKeysForAssign(nextStep, assignKey);

      const normalized = normalizeForCtx(analyzed.data, consumerKeys);
      
      console.log('Extra analysis data received from LLM:', analyzed);
      console.log('Normalized ctx value:', normalized);

      if (assignKey) {
        ctx[assignKey] = normalized;
      }
      if(analyzed.newInstructionPlan!=null && analyzed.newInstructionPlan!=''){
        console.log('analyzed.newInstructionPlan: ', analyzed.newInstructionPlan)
        executePlanSteps(analyzed.newInstructionPlan, config, resolveComponent, setUI, setSerializedMessages,userMessage,prevMessagesForContext, ctx)
        return
      }
    } catch (e) {
      console.error(e);
    }

}
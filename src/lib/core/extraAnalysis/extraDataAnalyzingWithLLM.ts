import type { AutoUIConfig } from '@lib/types';
import { buildDataAnalyzingPrompt } from './buildDataAnalyzingPrompt';
import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import { parseAnalyzedData } from '../../utils/formatting/parseAnalyzedData';

export const extraAnalysisWithLLM = async (
  data: unknown,
  config: AutoUIConfig,
  userMessage: string,
  prevMessagesForContext:string,
  plan: InstructionPlan,
  currentStep: InstructionStep,
  currentStepIndex: number,
  expectedSchema: { parseTo: 'array' | 'object' | 'primitive'; schema: unknown } | null
): Promise<any> => {
  try {
    const prompt = await buildDataAnalyzingPrompt(
      data,
      config,
      userMessage,
      prevMessagesForContext,
      plan,
      currentStep,
      currentStepIndex,
      expectedSchema
    );
    
    console.log(`📤 [ExtraAnalysis] Sending request to LLM (prompt length: ${prompt.length} chars)`);
    
    const autouiProxyUrl = config.llm.proxyUrl??'https://autoui-proxy.onrender.com'
    const res = await fetch(`${autouiProxyUrl}/chat/extraAnalysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTOUI-APP-ID': config.appId,
        ...(config.llm.sharedSecret && {
          'X-AUTOUI-SECRET': config.llm.sharedSecret,
        }),
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: config.llm.temperature ?? 0.2,
        appId: config.appId,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [ExtraAnalysis] API error ${res.status}:`, errorText);
      throw new Error(`AutoUI proxy error: ${res.status} - ${errorText}`);
    }

    let responseText = await res.text();
    console.log('✅ [ExtraAnalysis] Raw response received (text):', responseText.substring(0, 200));
    
    const codeBlockMatch = responseText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (codeBlockMatch) {
      responseText = codeBlockMatch[1].trim();
      console.log('✅ [ExtraAnalysis] Stripped markdown code blocks');
    }
    
    let content: any;
    try {
      content = JSON.parse(responseText);
      console.log('✅ [ExtraAnalysis] Parsed JSON response');
    } catch (e) {
      console.error('❌ [ExtraAnalysis] Response is not valid JSON:', e);
      console.error('❌ [ExtraAnalysis] Response text:', responseText);
      throw new Error(`Invalid JSON response from LLM: ${responseText.substring(0, 200)}`);
    }
    
    if (content && typeof content === 'object') {
      if ('content' in content && typeof content.content === 'string') {
        try {
          let nestedContent = content.content;
          const nestedCodeBlockMatch = nestedContent.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
          if (nestedCodeBlockMatch) {
            nestedContent = nestedCodeBlockMatch[1].trim();
            console.log('✅ [ExtraAnalysis] Stripped markdown code blocks from nested content');
          }
          content = JSON.parse(nestedContent);
          console.log('✅ [ExtraAnalysis] Extracted and parsed content from wrapper');
        } catch (e) {
          console.warn('⚠️ [ExtraAnalysis] content.content is not JSON, using original');
        }
      } else if ('response' in content) {
        if (typeof content.response === 'string') {
          let responseStr = content.response;
          const responseCodeBlockMatch = responseStr.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
          if (responseCodeBlockMatch) {
            responseStr = responseCodeBlockMatch[1].trim();
            try {
              content = JSON.parse(responseStr);
              console.log('✅ [ExtraAnalysis] Extracted and parsed response from wrapper (stripped markdown)');
            } catch (e) {
              content = responseStr;
              console.log('✅ [ExtraAnalysis] Extracted response from wrapper (as string)');
            }
          } else {
            content = content.response;
            console.log('✅ [ExtraAnalysis] Extracted response from wrapper');
          }
        } else {
          content = content.response;
          console.log('✅ [ExtraAnalysis] Extracted response from wrapper');
        }
      } else if ('message' in content && typeof content.message === 'string') {
        try {
          let messageStr = content.message;
          const messageCodeBlockMatch = messageStr.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
          if (messageCodeBlockMatch) {
            messageStr = messageCodeBlockMatch[1].trim();
            console.log('✅ [ExtraAnalysis] Stripped markdown code blocks from message');
          }
          content = JSON.parse(messageStr);
          console.log('✅ [ExtraAnalysis] Extracted and parsed message from wrapper');
        } catch (e) {
          console.warn('⚠️ [ExtraAnalysis] message is not JSON, using original');
        }
      }
    }
    
    console.log('✅ [ExtraAnalysis] Final content to parse:', typeof content, content);
    
    const parsed = parseAnalyzedData(content);
    console.log('✅ [ExtraAnalysis] Parsed response:', {
      hasData: !!parsed.data,
      hasNewPlan: !!parsed.newInstructionPlan,
      parseTo: parsed.parseTo
    });
    
    return parsed;
  } catch (error) {
    console.error('❌ [ExtraAnalysis] Error during analysis:', error);
    return {
      parseTo: expectedSchema?.parseTo ?? 'primitive',
      data: data,
      newInstructionPlan: null
    };
  }
};

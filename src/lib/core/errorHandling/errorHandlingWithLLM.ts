import type { AutoUIConfig } from '@lib/types';
import type { ErrorHandlingRequest, ErrorHandlingResponse } from '@lib/types/errorHandlingTypes';
import { callErrorHandlingAPI, parseAPIResponse } from './apiHelpers';
import { createFallbackErrorResponse } from './fallbackMessages';
import { buildErrorHandlingPrompt } from './promptBuilding';

export const errorHandlingWithLLM = async (
  request: ErrorHandlingRequest,
  context: Record<string, any>,
  config: AutoUIConfig,
): Promise<ErrorHandlingResponse> => {
  const prompt = await buildErrorHandlingPrompt(request, context, config);
  
  try {
    const response = await callErrorHandlingAPI(prompt, config);
    
    if (!response.ok) {
      console.error(`[Error Handling] API failed with status ${response.status}. Technical errors:`, request.failedStep.errors);
      return await createFallbackErrorResponse(request, context, config);
    }

    const result = await parseAPIResponse(response, request, config);
    
    if (result.errorMessage) {
      console.error('🔍 [Error Handling] Debug info:', result.errorMessage);
    }
    
    return result;
  } catch (error) {
    console.error('[Error Handling] Failed to call API. Technical error:', error);
    console.error('[Error Handling] Original errors:', request.failedStep.errors);
    const fallback = await createFallbackErrorResponse(request, context, config);
    
    if (fallback.errorMessage) {
      console.error('🔍 [Error Handling] Debug info:', fallback.errorMessage);
    }
    
    return fallback;
  }
};

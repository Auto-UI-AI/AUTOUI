import type { AutoUIConfig } from '@lib/types';
import type { ErrorHandlingRequest, ErrorHandlingResponse } from '@lib/types/errorHandlingTypes';

export async function callErrorHandlingAPI(
  prompt: string,
  config: AutoUIConfig,
): Promise<Response> {
  const autouiProxyUrl = config.llm.proxyUrl ?? 'https://autoui-proxy.onrender.com';
  
  return fetch(`${autouiProxyUrl}/chat/errorHandling`, {
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
}

export async function parseAPIResponse(
  response: Response,
  _request: ErrorHandlingRequest,
  _config: AutoUIConfig,
): Promise<ErrorHandlingResponse> {
  try {
    const content = await response.json();
    console.log('Error handling response:', content);
    
    let parsedResponse: ErrorHandlingResponse;
    
    if (typeof content === 'string') {
      try {
        parsedResponse = JSON.parse(content);
      } catch {
        parsedResponse = {
          fallbackSuggestion: sanitizeErrorMessage(content),
          shouldRetry: false,
        };
      }
    } else {
      parsedResponse = {
        newInstructionPlan: content.newInstructionPlan ?? null,
        errorMessage: content.errorMessage ?? undefined,
        shouldRetry: content.shouldRetry ?? false,
        modifiedContext: content.modifiedContext ?? null,
        fallbackSuggestion: content.fallbackSuggestion ? sanitizeErrorMessage(content.fallbackSuggestion) : undefined,
      };
    }
    
    if (!parsedResponse.fallbackSuggestion && !parsedResponse.errorMessage) {
      parsedResponse.fallbackSuggestion = "I encountered an issue while processing your request. Could you try rephrasing it or providing more details?";
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('[Error Handling] Failed to parse response. Technical error:', error);
    throw error;
  }
}
function sanitizeErrorMessage(message: string): string {
  const technicalTerms = [
    /validation\s+failed/gi,
    /required\s+prop/gi,
    /required\s+parameter/gi,
    /schema\s+validation/gi,
    /type\s+error/gi,
    /undefined/gi,
    /null\s+reference/gi,
    /runtime\s+error/gi,
    /component\s+render/gi,
  ];
  
  let sanitized = message;
  technicalTerms.forEach(term => {
    sanitized = sanitized.replace(term, '');
  });
  
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized || message;
}


import type { InstructionStep } from '@lib/types/llmTypes';

export function formatExecutedStepsForErrorHandling(executedSteps: InstructionStep[]): string {
  if (executedSteps.length === 0) {
    return '  (none)';
  }

  return executedSteps.map((s, i) => {
    let detail = `  ${i + 1}. ${s.type}`;
    if (s.type === 'function') {
      const funcStep = s as { type: 'function'; name: string; params?: Record<string, any> };
      detail += `: ${funcStep.name}`;
      if (funcStep.params && Object.keys(funcStep.params).length > 0) {
        detail += ` (params: ${JSON.stringify(funcStep.params)})`;
      }
    } else if (s.type === 'component') {
      const compStep = s as { type: 'component'; name: string; props?: Record<string, any> };
      detail += `: ${compStep.name}`;
      if (compStep.props && Object.keys(compStep.props).length > 0) {
        detail += ` (props: ${JSON.stringify(compStep.props)})`;
      }
    } else if (s.type === 'text') {
      const textStep = s as { type: 'text'; text: string };
      detail += `: "${textStep.text.substring(0, 50)}${textStep.text.length > 50 ? '...' : ''}"`;
    }
    return detail;
  }).join('\n');
}


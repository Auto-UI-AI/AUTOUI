import type { AutoUIConfig } from '../../types';

export function resolveProps(input: any, ctx: Record<string, any>, config: AutoUIConfig): any {
  if (input == null) return input;

  if (typeof input === 'string') {
    if (input.startsWith('{{') && input.endsWith('}}')) {
      const key = input.slice(2, -2).trim();
      return ctx[key];
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((v) => resolveProps(v, ctx, config));
  }

  if (typeof input === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) {
      if (typeof v === 'string' && /^on[A-Z]/.test(k) && config.functions[v]) {
        const fnName = v;
        out[k] = async (...args: any[]) => await config.functions[fnName].callFunc({ args });
      } else {
        out[k] = resolveProps(v, ctx, config);
      }
    }
    
    return out;
  }

  return input;
}

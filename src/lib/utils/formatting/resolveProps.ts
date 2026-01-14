import type { AutoUIConfig, AutoUIComponent } from '../../types';

export function resolveProps(
  input: any,
  ctx: Record<string, any>,
  config: AutoUIConfig,
  componentConfig?: AutoUIComponent,
): any {
  if (input == null) return input;

  if (typeof input === 'string') {
    if (input.startsWith('{{') && input.endsWith('}}')) {
      const key = input.slice(2, -2).trim();
      const value = ctx[key];
      if (value === undefined) {
        console.warn(`⚠️ [ResolveProps] Context key "${key}" not found. Available keys:`, Object.keys(ctx));
      }
      return value;
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((v) => resolveProps(v, ctx, config, componentConfig));
  }

  if (typeof input === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) {
      if (typeof v === 'string' && /^on[A-Z]/.test(k)) {
        let resolved = false;
        
        if (componentConfig?.callbacks?.[v]) {
          const callback = componentConfig.callbacks[v];
          out[k] = typeof callback === 'function' ? callback : callback.callFunc;
          console.log(`🔗 [ResolveProps] Resolved dynamic callback "${k}" → "${v}" from component config`);
          resolved = true;
        }
        else if (componentConfig?.callbacks?.[k]) {
          const callback = componentConfig.callbacks[k];
          out[k] = typeof callback === 'function' ? callback : callback.callFunc;
          console.log(`🔗 [ResolveProps] Resolved direct callback "${k}" from component config`);
          resolved = true;
        }   
        else if (config.functions[v]) {
          const fnName = v;
          out[k] = async (...args: any[]) => await config.functions[fnName].callFunc({ args });
          console.log(`🔗 [ResolveProps] Resolved callback "${k}" → function "${fnName}"`);
          resolved = true;
        }
        
        if (!resolved) {
          console.warn(`⚠️ [ResolveProps] Callback "${k}" with value "${v}" not found. Available callbacks:`, 
            componentConfig?.callbacks ? Object.keys(componentConfig.callbacks) : 'none');
          out[k] = resolveProps(v, ctx, config, componentConfig);
        }
      } else {
        out[k] = resolveProps(v, ctx, config, componentConfig);
      }
    }
    
    return out;
  }

  return input;
}

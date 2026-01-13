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
      // Handle callback props (onClick, onAddToCart, etc.)
      // Supports three patterns for callback resolution:
      // 1. Dynamic callback selection: { onAction: "addToCart" } → uses componentConfig.callbacks.addToCart
      //    Allows LLM to dynamically choose which callback to use
      // 2. Direct callback mapping: { onAddToCart: "onAddToCart" } → uses componentConfig.callbacks.onAddToCart
      //    Standard pattern where prop name matches callback name
      // 3. Function reference: { onClick: "submitOrder" } → uses config.functions.submitOrder
      //    Maps to a function in the config (for function calls, not component callbacks)
      if (typeof v === 'string' && /^on[A-Z]/.test(k)) {
        let resolved = false;
        
        // 1. Dynamic callback selection: value is a callback name in componentConfig.callbacks
        //    Example: { onAction: "addToCart" } → uses componentConfig.callbacks.addToCart.callFunc
        //    This allows LLM to choose between different callbacks dynamically
        if (componentConfig?.callbacks?.[v]) {
          const callback = componentConfig.callbacks[v];
          out[k] = typeof callback === 'function' ? callback : callback.callFunc;
          console.log(`🔗 [ResolveProps] Resolved dynamic callback "${k}" → "${v}" from component config`);
          resolved = true;
        }
        // 2. Direct callback mapping: prop name matches a callback in componentConfig.callbacks
        //    Example: { onAddToCart: "onAddToCart" } or { onAddToCart: "addToCart" } → uses componentConfig.callbacks.onAddToCart.callFunc
        else if (componentConfig?.callbacks?.[k]) {
          const callback = componentConfig.callbacks[k];
          out[k] = typeof callback === 'function' ? callback : callback.callFunc;
          console.log(`🔗 [ResolveProps] Resolved direct callback "${k}" from component config`);
          resolved = true;
        }
        // 3. Function reference: value is a function name in config.functions
        //    Example: { onClick: "submitOrder" } → uses config.functions.submitOrder
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

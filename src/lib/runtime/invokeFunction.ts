import type { AutoUIFunction } from "@lib/types";
import type { FunctionStep } from "@lib/types/llmTypes";
import { isPlainObject } from "@lib/utils/isPlainObject";
export const invokeFunction = async (fCfg:AutoUIFunction, step: FunctionStep, ): Promise<any> => {
    const fn = fCfg.callFunc as any;
    const anyStep = step as any;
    const hasArgs = Array.isArray(anyStep.args);
    const hasParamsObj = !!anyStep.params && typeof anyStep.params === 'object';

    let out: any;

    if (hasArgs) {
      let args = anyStep.args as unknown[];
      if (args.length === 1 && isPlainObject(args[0]) && Array.isArray(fCfg.params) && fCfg.params.length > 0) {
        const obj = args[0] as Record<string, unknown>;
        args = (fCfg.params as string[]).map((k) => obj[k]);
      }
      try {
        out = await (fn as (...a: unknown[]) => any)(...args);
      } catch {
        out = await (fn as (a?: unknown[]) => any)(args);
      }
    } else if (hasParamsObj) {
      out = await (fn as (p?: any) => any)(anyStep.params);
    } else {
      out = await fn();
    }
    return out;
}

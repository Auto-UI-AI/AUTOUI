const nativeMax = Math.max;
const nativeMin = Math.min;

const FUNC_ERROR_TEXT = 'Expected a function';

export interface DebounceOptions {
  leading?: boolean;
  maxWait?: number;
  trailing?: boolean;
}

export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 0,
  options: DebounceOptions = {},
): DebouncedFunc<T> {
  let lastArgs: any;
  let lastThis: any;
  let maxWait: number | undefined;
  let result: ReturnType<T> | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;

  let leading = false;
  let maxing = false;
  let trailing = true;

  if (typeof func !== 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  wait = Number(wait) || 0;

  if (typeof options === 'object') {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(Number(options.maxWait) || 0, wait) : undefined;

    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;

    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;

    timerId = setTimeout(timerExpired, wait);

    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - (lastCallTime as number);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const remaining = wait - timeSinceLastCall;

    return maxing ? nativeMin(remaining, (maxWait as number) - timeSinceLastInvoke) : remaining;
  }

  function shouldInvoke(time: number) {
    if (lastCallTime === undefined) return true;

    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return timeSinceLastCall >= wait || timeSinceLastCall < 0 || (maxing && timeSinceLastInvoke >= (maxWait as number));
  }

  function timerExpired() {
    const time = Date.now();

    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(this: unknown, ...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(time);
      }

      if (maxing) {
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(time);
      }
    }

    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }

    return result;
  }

  (debounced as DebouncedFunc<T>).cancel = cancel;
  (debounced as DebouncedFunc<T>).flush = flush;

  return debounced as DebouncedFunc<T>;
}

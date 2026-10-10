export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottledFunction<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
}

export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number,
  options: ThrottleOptions = {},
): ThrottledFunction<TArgs> {
  const { leading = true, trailing = false } = options;

  let lastCallTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const invoke = (args: TArgs) => {
    lastCallTime = Date.now();
    fn(...args);
  };

  const throttled = (...args: TArgs) => {
    const now = Date.now();
    const elapsed = now - lastCallTime;
    const remaining = wait - elapsed;

    lastArgs = args;

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (leading) {
        invoke(args);
        lastArgs = null;
      } else if (trailing && !timer) {
        timer = setTimeout(() => {
          timer = null;
          if (lastArgs) {
            invoke(lastArgs);
            lastArgs = null;
          }
        }, wait);
      }
    } else if (trailing && !timer) {
      timer = setTimeout(() => {
        timer = null;
        lastCallTime = Date.now();
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  return throttled;
}

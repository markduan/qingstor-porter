const noop = (): void => undefined;

let verbose = false;

export function setLogLever(level: 'verbose' | 'error'): void {
  if (level === 'error') {
    return;
  }

  if (level === 'verbose') {
    verbose = true;
  }
}

export default new Proxy(console, {
  get: function (target, propKey, receiver): any {
    if (verbose) {
      return Reflect.get(target, propKey, receiver);
    }

    if (propKey === 'debug') {
      return noop;
    }

    return Reflect.get(target, propKey, receiver);
  },
});

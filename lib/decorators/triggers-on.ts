/**
 * Method decorator that triggers on the specified event.
 * @param event Event that triggers the decorator
 * @returns void
 */
export const TriggersOn = (event: string): MethodDecorator => {
  return function (target, propertyKey, descriptor) {
    Reflect.defineMetadata(`${event}:${String(propertyKey)}`, propertyKey, target)

    return descriptor
  }
}

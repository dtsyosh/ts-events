/**
 * Method decorator that triggers on the specified event.
 * @param event Event that triggers the decorator
 * @returns void
 */
export const TriggersOn = (...events: string[]): MethodDecorator => {
  return function (target, propertyKey, descriptor) {
    const uniqueEvents = [...new Set(events)]

    uniqueEvents.forEach((event) => {
      Reflect.defineMetadata(`${event}:${String(propertyKey)}`, propertyKey, target)
    })

    return descriptor
  }
}

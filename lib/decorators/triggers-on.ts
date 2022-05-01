/**
 * Method decorator that triggers on the specified event.
 * @param event Event that triggers the decorator
 * @returns void
 */
export const TriggersOn = (event: string) => {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(event, propertyKey, target)

    return descriptor
  }
}

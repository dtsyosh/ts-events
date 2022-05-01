/**
 * Method decorator that triggers on the specified event.
 * @param event Event that triggers the decorator
 * @returns void
 */
export const TriggersOn = (event: string): MethodDecorator => {
  return function (target, propertyKey, descriptor) {
    Reflect.defineMetadata(event, propertyKey, target)

    return descriptor
  }
}

/**
 * Class decorator that triggers on the specified event on all methods of a class.
 * @param event Event that triggers the decorator
 * @returns void
 */
export const TriggersOnClass = (event: string): ClassDecorator => {
  return function (target) {
    Reflect.defineMetadata(event, target, target.prototype)
  }
}

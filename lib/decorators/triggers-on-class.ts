/**
 * Class decorator that triggers on the specified event on all methods of a class.
 * @param event Event that triggers the decorator
 * @returns void
 */
export const TriggersOnClass = (...event: string[]): ClassDecorator => {
  return function (target) {
    const uniqueEvents = [...new Set(event)]

    uniqueEvents.forEach((event) => {
      Reflect.defineMetadata(event, target, target.prototype)
    })
  }
}

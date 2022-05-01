export type Decorator<T> = (
  event: T
) => (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor

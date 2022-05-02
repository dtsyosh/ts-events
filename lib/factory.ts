import 'reflect-metadata'
import { DependencyContainer } from 'tsyringe'
import { TriggersOn } from '~/decorators/triggers-on'
import { TriggersOnClass } from '~/decorators/triggers-on-class'
import { FactoryParams, Listener, PointrEventListener, Subscriber } from '~/interfaces'

export class PointrEvents<EventsNames extends string> {
  private events: Array<EventsNames>
  private subscribers: Subscriber<EventsNames> = {} as Subscriber<EventsNames>
  private strategy: 'tsyringe'
  private container?: DependencyContainer

  constructor(params: FactoryParams<EventsNames>) {
    this.events = params.events
    this.strategy = params.strategy
    this.container = params.container

    this.initializeEvents()
    this.addListenersMetadata()
  }

  async dispatch<T>(event: EventsNames, params?: T): Promise<void> {
    this.preventUnnamedEventsToProceed(event)

    await Promise.all(this.subscribers[event].map((listener) => listener(params)))
  }

  on(event: EventsNames, listener: Listener): void {
    this.preventUnnamedEventsToProceed(event)

    this.subscribers[event].push(listener)
  }

  static getTypedDecorators<EventsNames extends string>() {
    return {
      TriggersOn: (event: EventsNames) => TriggersOn(event),
      TriggersOnClass: (event: EventsNames) => TriggersOnClass(event)
    }
  }

  private addListenersMetadata(): void {
    if (this.strategy === 'tsyringe') {
      this.addListenersMetadataWithTsyringe()
    }
  }

  private addListenersMetadataWithTsyringe(): void {
    const container = this.container as DependencyContainer

    if (!container.isRegistered('PointrEventListener')) {
      return
    }

    const instances = container.resolveAll<PointrEventListener>('PointrEventListener')
    instances.forEach((instance) => {
      const metadataKeys = Reflect.getMetadataKeys(instance)

      metadataKeys.forEach((key) => {
        const value = Reflect.getMetadata(key, instance)
        const prototype = Object.getPrototypeOf(instance)

        // Metadata from method decorator
        if (typeof value === 'string') {
          this.on(key, prototype[value].bind(instance))

          return
        }

        // Metadata from class decorator
        const methods = Object.getOwnPropertyNames(prototype)

        methods
          .filter((method) => method !== 'constructor')
          .forEach((method) => this.on(key, prototype[method].bind(instance)))
      })
    })
  }

  private initializeEvents(): void {
    this.events.forEach((event) => {
      this.subscribers[event] = []
    })
  }

  private checkIfEventExists(event: EventsNames): boolean {
    return this.events.includes(event)
  }

  private preventUnnamedEventsToProceed(event: EventsNames): void {
    if (!this.checkIfEventExists(event)) {
      throw new Error(`Event ${event} is not registered`)
    }
  }
}

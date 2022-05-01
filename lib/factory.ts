import 'reflect-metadata'
import { DependencyContainer } from 'tsyringe'
import { FactoryParams, Listener, PointrEventListener, Subscriber } from '~/interfaces'

export class PointrEvents {
  private events: Array<string>
  private subscribers: Subscriber = {}
  private strategy: string
  private container?: DependencyContainer

  constructor(params: FactoryParams) {
    this.events = params.events
    this.strategy = params.strategy
    this.container = params.container

    this.initializeEvents()
    this.addListenersMetadata()
  }

  async dispatch<T>(event: string, params?: T): Promise<void> {
    this.preventUnnamedEventsToProceed(event)

    await Promise.all(this.subscribers[event].map((listener) => listener(params)))
  }

  on(event: string, listener: Listener): void {
    this.preventUnnamedEventsToProceed(event)

    this.subscribers[event].push(listener)
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
        const method = Reflect.getMetadata(key, instance)
        const prototype = Object.getPrototypeOf(instance)

        this.on(key, prototype[method].bind(instance))
      })
    })
  }

  private initializeEvents(): void {
    this.events.forEach((event) => {
      this.subscribers[event] = []
    })
  }

  private checkIfEventExists(event: string): boolean {
    return this.events.includes(event)
  }

  private preventUnnamedEventsToProceed(event: string): void {
    if (!this.checkIfEventExists(event)) {
      throw new Error(`Event ${event} is not registered`)
    }
  }
}

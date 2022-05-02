import { DependencyContainer } from 'tsyringe'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventListener {}

export type FactoryParams<T> =
  | {
      events: Array<T>
      strategy: 'tsyringe'
      container: DependencyContainer
    }
  | {
      events: Array<T>
      strategy?: 'none'
      container?: undefined
    }

export type Subscriber<EventsNames extends string> = Record<EventsNames, Listener[]>

export type Listener = (params: unknown) => void

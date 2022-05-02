import { DependencyContainer } from 'tsyringe'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PointrEventListener {}

export type FactoryParams<T> = {
  events: Array<T>
  strategy: 'tsyringe'
  container: DependencyContainer
}

export type Subscriber<EventsNames extends string> = Record<EventsNames, Listener[]>

export type Listener = (params: unknown) => void

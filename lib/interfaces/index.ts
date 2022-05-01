import { DependencyContainer } from 'tsyringe'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PointrEventListener {}

export type FactoryParams = {
  events: Array<string>
  strategy: 'tsyringe'
  container: DependencyContainer
}

export type Subscriber = {
  [key: string]: Listener[]
}

export type Listener = (params: unknown) => void

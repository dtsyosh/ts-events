# Events Package

This package was design to make it easy to implement an Event Driven architecture.

## What the package exposes

Two decorators:

```typescript
class SomeClass {
  @TriggersOn('SOME_EVENT')
  someMethod(eventPayload) {
    ...
  }
}
```

> This decorator will trigger the `someMethod` method whenever `SOME_EVENT` is fired.

```typescript
@TriggersOnClass('SOME_EVENT')
class SomeClass {
  someMethod(eventPayload) {
    ...
  }

  someOtherMethod(eventPayload) {
    ...
  }
}
```

> This decorator will trigger all methods of a class (eg. `someMethod` and `someOtherMethod`) whenever `SOME_EVENT` is fired.

an `Interface`

```typescript
class SomeClassYouWantToAddDecorators implements EventListener {
  ...
}
```

**IMPORTANT** : Your class _MUST_ implement the `EventListener` interface in order to be able to use the `@TriggersOn` decorator.

and the `EventEmitter` class

```typescript
class EventEmitter {
  on(eventName, listener) {
    ...
  }
  dispatch(eventName, payload) {
    ...
  }

  static getTypedDecorators<YourEventNames>(): { TriggersOn; TriggersOnClass }
}
```

### How to implement

- Create a type for your events `name: payload` and another one with only the event names, example:

```typescript
type MyEvents = {
  'some.event': { somePayload: string }
}
type MyEventsNames = keyof MyEvents
```

- Create a class that will use the `EventListener` class but with your types, example:

```typescript
import { EventEmitter } from '@boardme/events'

class MyEventEmitter {
  emitter: EventEmitter<MyEventsNames>

  constructor() {
    this.emitter = new EventEmitter<MyEventsNames>({
      events: ['some.event'], // You will be forced to put all the events you want to listen to in this array
      strategy: 'tsyringe',
      container: container
    })
  }

  emit<T extends MyEventsName>(event: T, data: MyEvents[T]) {
    this.emitter.emit(event, data)
  }

  on<T extends MyEventsName>(event: T, callback: (data: MyEvents[T]) => void) {
    this.emitter.on(event, callback)
  }
}

export const { TriggersOn, TriggersOnClass } = EventEmitter.getTypedDecorators<MyEventsNames>()
```

> You can use the decorators exported directly from the package, but these won't be type-safe.

- This implementation will give you all the typing support to handle your events, example:

### Listening without the decorators

```typescript
const myEventEmitter = new MyEventEmitter({
  events: ['some.event']
})

myEventEmitter.on('some.event', (data) => {
  console.log(data)
})

myEventEmitter.dispatch('some.event', { somePayload: 'hello' })

// Output:
// { somePayload: 'hello' }
```

### Listening with decorators

> Method

```typescript
import { container } from 'tsyringe'
import { EventListener } from '@boardme/events'

const myEventEmitter = new MyEventEmitter({
  events: ['some.event'],
  strategy: 'tsyringe',
  container
})

class MyClass implements EventListener {
  @TriggersOn('some.event')
  someMethod(eventPayload) {
    console.log(eventPayload)
  }
}

container.register('EventListener', { useClass: MyClass })

myEventEmitter.dispatch('some.event', { somePayload: 'hello' })

// Output
// { somePayload: 'hello' }
```

> Class

```typescript
import { container } from 'tsyringe'
import { EventListener } from '@boardme/events'

const myEventEmitter = new MyEventEmitter({
  events: ['some.event'],
  strategy: 'tsyringe',
  container
})

@TriggersOnClass('some.event')
class MyClass implements EventListener {
  someMethod(eventPayload) {
    console.log(eventPayload)
  }

  someOtherMethod(eventPayload) {
    console.log(2, eventPayload)
  }
}

container.register('EventListener', { useClass: MyClass })

myEventEmitter.dispatch('some.event', { somePayload: 'hello' })

// Output
// { somePayload: 'hello' }
// 2 { somePayload: 'hello' }
```

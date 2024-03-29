import 'reflect-metadata'
import { container } from 'tsyringe'
import { EventEmitter, EventListener, TriggersOn, TriggersOnClass } from '../lib'

describe('test events', () => {
  afterEach(() => {
    container.clearInstances()
    container.reset()
    jest.clearAllMocks()
  })
  it('should add metadata to class with decorator', () => {
    class TestClass implements EventListener {
      @TriggersOn('test')
      test() {
        return
      }
    }
    const testClass = new TestClass()

    expect(Reflect.getMetadataKeys(testClass)).toHaveLength(1)
  })

  it('should add metadata to different methods to class with decorator', () => {
    class TestClass implements EventListener {
      @TriggersOn('test')
      test() {
        return
      }
      @TriggersOn('test2')
      test2() {
        return
      }
    }
    const testClass = new TestClass()

    const metadataKeys = Reflect.getMetadataKeys(testClass)

    expect(metadataKeys).toHaveLength(2)
    expect(metadataKeys).toContain('test:test')
    expect(metadataKeys).toContain('test2:test2')
  })

  it('should do nothing if try to instantiate PointrEvents without any listener registered in the container', () => {
    container.reset()

    expect(
      () =>
        new EventEmitter({
          events: [],
          container,
          strategy: 'tsyringe'
        })
    ).not.toThrowError()
  })

  it('should instantiate PointrEvents correctly if there is at least one class implementing the EventListener interface', () => {
    class TestClass implements EventListener {
      @TriggersOn('test')
      test() {
        return
      }
    }
    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter({
      events: ['test'],
      container,
      strategy: 'tsyringe'
    })

    expect(events).toBeInstanceOf(EventEmitter)
  })

  it('should throw an error if the event is not registered', () => {
    const EVENT_NAME = 'test'

    class TestClass implements EventListener {
      @TriggersOn(EVENT_NAME)
      test() {
        return
      }
    }
    container.register('EventListener', { useClass: TestClass })

    expect(
      () =>
        new EventEmitter({
          events: ['test2'],
          container,
          strategy: 'tsyringe'
        })
    ).toThrowError(`Event ${EVENT_NAME} is not registered`)
  })

  it('should dispatch events correctly', async () => {
    const EVENT_NAME = 'test'

    class TestClass implements EventListener {
      @TriggersOn(EVENT_NAME)
      test() {
        return
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    events.emit(EVENT_NAME)
    events.emit(EVENT_NAME)
    events.emit(EVENT_NAME)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(3)
  })

  it('should dispatch events correctly with params', async () => {
    const EVENT_NAME = 'test'

    class TestClass implements EventListener {
      @TriggersOn(EVENT_NAME)
      test(params: unknown) {
        return params
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    const params = { test: 'test' }

    events.emit(EVENT_NAME, params)

    expect(TestClass.prototype.test).toHaveBeenCalledWith(params)
  })

  it('should dispatch events correctly between different classes', async () => {
    const EVENT1_NAME = 'test'
    const EVENT2_NAME = 'test2'

    class TestClass implements EventListener {
      @TriggersOn(EVENT1_NAME)
      test() {
        return
      }
    }

    class TestClass2 implements EventListener {
      @TriggersOn(EVENT2_NAME)
      test() {
        return
      }
      @TriggersOn(EVENT1_NAME)
      test2() {
        return
      }
    }

    jest.spyOn(TestClass.prototype, 'test')
    jest.spyOn(TestClass2.prototype, 'test')
    jest.spyOn(TestClass2.prototype, 'test2')

    container.register('EventListener', { useClass: TestClass })
    container.register('EventListener', { useClass: TestClass2 })

    const events = new EventEmitter({
      events: [EVENT1_NAME, EVENT2_NAME],
      container,
      strategy: 'tsyringe'
    })

    events.emit(EVENT1_NAME)
    events.emit(EVENT2_NAME)
    events.emit(EVENT2_NAME)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(1)
    expect(TestClass2.prototype.test).toHaveBeenCalledTimes(2)
    expect(TestClass2.prototype.test2).toHaveBeenCalledTimes(1)
  })

  it('should dispatch events correctly using class decorators with params', async () => {
    const EVENT_NAME = 'test'

    @TriggersOnClass(EVENT_NAME)
    class TestClass implements EventListener {
      test(params: unknown) {
        return params
      }

      test2(params: unknown) {
        return params
      }
    }

    jest.spyOn(TestClass.prototype, 'test')
    jest.spyOn(TestClass.prototype, 'test2')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    const params = { test: 'test' }

    events.emit(EVENT_NAME, params)

    expect(TestClass.prototype.test).toHaveBeenCalledWith(params)
    expect(TestClass.prototype.test2).toHaveBeenCalledWith(params)
    expect(TestClass.prototype.test).toHaveBeenCalledTimes(1)
    expect(TestClass.prototype.test2).toHaveBeenCalledTimes(1)
  })

  it('should get correct typing when using getTypedDecorators', () => {
    const EVENT_NAME = 'test'
    const events = new EventEmitter<'test'>({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    const { TriggersOn, TriggersOnClass } = EventEmitter.getTypedDecorators<'test'>()
    class TestClass implements EventListener {
      @TriggersOn('test')
      test() {
        return
      }
    }

    @TriggersOnClass('test')
    class TestClass2 implements EventListener {
      test() {
        return
      }
    }

    container.register('EventListener', { useClass: TestClass })
    container.register('EventListener', { useClass: TestClass2 })

    expect(events.emit('test')).resolves.toBeUndefined()
  })

  it('should declare instantiate the event emitter without a strategy', () => {
    const events = new EventEmitter({
      events: ['test']
    })

    expect(events).toBeInstanceOf(EventEmitter)
  })

  it('should be able to listen to events without using decorators (using .on explicitly)', () => {
    const EVENT_NAME = 'test'
    const events = new EventEmitter<'test'>({
      events: [EVENT_NAME]
    })

    const listener = jest.fn()

    events.on(EVENT_NAME, listener)

    expect(listener).toHaveBeenCalledTimes(0)

    events.emit(EVENT_NAME)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should execute all methods that are decorated with the same event name', () => {
    const EVENT_NAME = 'test'

    class TestClass implements EventListener {
      @TriggersOn(EVENT_NAME)
      test() {
        return
      }

      @TriggersOn(EVENT_NAME)
      test2() {
        return
      }
    }

    jest.spyOn(TestClass.prototype, 'test')
    jest.spyOn(TestClass.prototype, 'test2')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter<'test'>({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    events.emit(EVENT_NAME)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(1)
    expect(TestClass.prototype.test2).toHaveBeenCalledTimes(1)
  })

  it('should trigger the method for more than one event', () => {
    const EVENT_NAME = 'test'
    const EVENT_NAME2 = 'test2'

    class TestClass implements EventListener {
      @TriggersOn(EVENT_NAME, EVENT_NAME2)
      test() {
        return
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter<'test' | 'test2'>({
      events: [EVENT_NAME, EVENT_NAME2],
      container,
      strategy: 'tsyringe'
    })

    events.emit(EVENT_NAME)
    events.emit(EVENT_NAME2)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(2)
  })

  it('should trigger the method for more than one event using class decorators', () => {
    const EVENT_NAME = 'test'
    const EVENT_NAME2 = 'test2'

    @TriggersOnClass(EVENT_NAME, EVENT_NAME2)
    class TestClass implements EventListener {
      test() {
        return
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter<'test' | 'test2'>({
      events: [EVENT_NAME, EVENT_NAME2],
      container,
      strategy: 'tsyringe'
    })

    events.emit(EVENT_NAME)
    events.emit(EVENT_NAME2)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(2)
  })

  it('should trigger the method for more than one event with correct payloads', () => {
    const EVENT_NAME = 'test'
    const EVENT_NAME2 = 'test2'

    class TestClass implements EventListener {
      @TriggersOn(EVENT_NAME, EVENT_NAME2)
      test(payload: unknown) {
        return payload
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter<'test' | 'test2'>({
      events: [EVENT_NAME, EVENT_NAME2],
      container,
      strategy: 'tsyringe'
    })

    const payload = { test: 'test' }
    const payload2 = { test: 'test2' }

    events.emit(EVENT_NAME, payload)
    events.emit(EVENT_NAME2, payload2)

    expect(TestClass.prototype.test).toHaveBeenNthCalledWith(1, payload)
    expect(TestClass.prototype.test).toHaveBeenNthCalledWith(2, payload2)
  })

  it('should trigger the method for more than one event with correct payloads using class decorators', () => {
    const EVENT_NAME = 'test'
    const EVENT_NAME2 = 'test2'

    @TriggersOnClass(EVENT_NAME, EVENT_NAME2)
    class TestClass implements EventListener {
      test(payload: unknown) {
        return payload
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('EventListener', { useClass: TestClass })

    const events = new EventEmitter<'test' | 'test2'>({
      events: [EVENT_NAME, EVENT_NAME2],
      container,
      strategy: 'tsyringe'
    })

    const payload = { test: 'test' }
    const payload2 = { test: 'test2' }

    events.emit(EVENT_NAME, payload)
    events.emit(EVENT_NAME2, payload2)

    expect(TestClass.prototype.test).toHaveBeenNthCalledWith(1, payload)
    expect(TestClass.prototype.test).toHaveBeenNthCalledWith(2, payload2)
  })
})

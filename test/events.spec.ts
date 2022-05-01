import 'reflect-metadata'
import { container } from 'tsyringe'
import { PointrEventListener, PointrEvents, TriggersOn } from '../lib'
import { TriggersOnClass } from '../lib/decorators/triggers-on'

describe('test events', () => {
  afterEach(() => {
    container.clearInstances()
    container.reset()
    jest.clearAllMocks()
  })
  it('should add metadata to class with decorator', () => {
    class TestClass implements PointrEventListener {
      @TriggersOn('test')
      test() {
        return
      }
    }
    const testClass = new TestClass()

    expect(Reflect.getMetadataKeys(testClass)).toHaveLength(1)
  })

  it('should add metadata to different methods to class with decorator', () => {
    class TestClass implements PointrEventListener {
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
    expect(metadataKeys).toContain('test')
    expect(metadataKeys).toContain('test2')
  })

  it('should do nothing if try to instantiate PointrEvents without any listener registered in the container', () => {
    container.reset()

    expect(
      () =>
        new PointrEvents({
          events: [],
          container,
          strategy: 'tsyringe'
        })
    ).not.toThrowError()
  })

  it('should instantiate PointrEvents correctly if there is at least one class implementing the PointrEventListener interface', () => {
    class TestClass implements PointrEventListener {
      @TriggersOn('test')
      test() {
        return
      }
    }
    container.register('PointrEventListener', { useClass: TestClass })

    const events = new PointrEvents({
      events: ['test'],
      container,
      strategy: 'tsyringe'
    })

    expect(events).toBeInstanceOf(PointrEvents)
  })

  it('should throw an error if the event is not registered', () => {
    const EVENT_NAME = 'test'

    class TestClass implements PointrEventListener {
      @TriggersOn(EVENT_NAME)
      test() {
        return
      }
    }
    container.register('PointrEventListener', { useClass: TestClass })

    expect(
      () =>
        new PointrEvents({
          events: ['test2'],
          container,
          strategy: 'tsyringe'
        })
    ).toThrowError(`Event ${EVENT_NAME} is not registered`)
  })

  it('should dispatch events correctly', async () => {
    const EVENT_NAME = 'test'

    class TestClass implements PointrEventListener {
      @TriggersOn(EVENT_NAME)
      test() {
        return
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('PointrEventListener', { useClass: TestClass })

    const events = new PointrEvents({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    events.dispatch(EVENT_NAME)
    events.dispatch(EVENT_NAME)
    events.dispatch(EVENT_NAME)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(3)
  })

  it('should dispatch events correctly with params', async () => {
    const EVENT_NAME = 'test'

    class TestClass implements PointrEventListener {
      @TriggersOn(EVENT_NAME)
      test(params: unknown) {
        return params
      }
    }

    jest.spyOn(TestClass.prototype, 'test')

    container.register('PointrEventListener', { useClass: TestClass })

    const events = new PointrEvents({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    const params = { test: 'test' }

    events.dispatch(EVENT_NAME, params)

    expect(TestClass.prototype.test).toHaveBeenCalledWith(params)
  })

  it('should dispatch events correctly between different classes', async () => {
    const EVENT1_NAME = 'test'
    const EVENT2_NAME = 'test2'

    class TestClass implements PointrEventListener {
      @TriggersOn(EVENT1_NAME)
      test() {
        return
      }
    }

    class TestClass2 implements PointrEventListener {
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

    container.register('PointrEventListener', { useClass: TestClass })
    container.register('PointrEventListener', { useClass: TestClass2 })

    const events = new PointrEvents({
      events: [EVENT1_NAME, EVENT2_NAME],
      container,
      strategy: 'tsyringe'
    })

    events.dispatch(EVENT1_NAME)
    events.dispatch(EVENT2_NAME)
    events.dispatch(EVENT2_NAME)

    expect(TestClass.prototype.test).toHaveBeenCalledTimes(1)
    expect(TestClass2.prototype.test).toHaveBeenCalledTimes(2)
    expect(TestClass2.prototype.test2).toHaveBeenCalledTimes(1)
  })

  it('should dispatch events correctly using class decorators with params', async () => {
    const EVENT_NAME = 'test'

    @TriggersOnClass(EVENT_NAME)
    class TestClass implements PointrEventListener {
      test(params: unknown) {
        return params
      }

      test2(params: unknown) {
        return params
      }
    }

    jest.spyOn(TestClass.prototype, 'test')
    jest.spyOn(TestClass.prototype, 'test2')

    container.register('PointrEventListener', { useClass: TestClass })

    const events = new PointrEvents({
      events: [EVENT_NAME],
      container,
      strategy: 'tsyringe'
    })

    const params = { test: 'test' }

    events.dispatch(EVENT_NAME, params)

    expect(TestClass.prototype.test).toHaveBeenCalledWith(params)
    expect(TestClass.prototype.test2).toHaveBeenCalledWith(params)
    expect(TestClass.prototype.test).toHaveBeenCalledTimes(1)
    expect(TestClass.prototype.test2).toHaveBeenCalledTimes(1)
  })
})

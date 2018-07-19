import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types'
import { disposeBoth } from '@most/disposable'
import { Get, Put, ResampleBuffer, getFrom, putTo } from './ResampleBuffer'

export const resample = <A, B, C, D> (f: (b: B, c: C) => D, buffer: ResampleBuffer<A, B>, values: Stream<A>, sampler: Stream<C>): Stream<D> =>
  new Resample(f, buffer, values, sampler)

export class Resample<A, B, C, D> {
  constructor (public readonly f: (b: B, c: C) => D, public readonly buffer: ResampleBuffer<A, B>, public readonly values: Stream<A>, public readonly sampler: Stream<C>) {}

  run (sink: Sink<D>, scheduler: Scheduler): Disposable {
    const bufferSink = new BufferSink(putTo(this.buffer), sink)
    const resampleSink = new ResampleSink(this.f, getFrom(this.buffer), sink)
    const valuesDisposable = this.values.run(bufferSink, scheduler)
    const samplerDisposable = this.sampler.run(resampleSink, scheduler)

    return disposeBoth(samplerDisposable, valuesDisposable)
  }
}

export class ResampleSink<B, C, D> {
  constructor (public readonly f: (b: B, c: C) => D, public readonly get: Get<B>, public readonly sink: Sink<D>) {}

  event (t: Time, c: C): void {
    const sampled = this.get()
    if(sampled === null) return

    this.sink.event(t, this.f(sampled.value, c))
  }

  error (t: Time, e: Error): void {
    this.sink.error(t, e)
  }

  end (t: Time): void {
    this.sink.end(t)
  }
}

export class BufferSink<A, B, C, D> {
  constructor (public readonly put: Put<A>, public readonly sink: Sink<D>) {}

  event (t: Time, a: A): void {
    this.put({ time: t, value: a })
  }

  error (t: Time, e: Error): void {
    this.sink.error(t, e)
  }

  end (t: Time): void {
    this.sink.end(t)
  }
}

import { Time } from '@most/types'

export type Maybe<A> = A | null

export type Event<A> = {
  time: Time,
  value: A
}

// Immutable buffer that implements a resampling strategy
export interface ResampleBuffer<A, B> {
  put (e: Event<A>): ResampleBuffer<A, B>,
  get (): [Maybe<Event<B>>, ResampleBuffer<A, B>]
}

export type Put<A> = (e: Event<A>) => void
export type Get<B> = () => Maybe<Event<B>>

// Expose a restricted mutable interface that only allows
// getting from a ResampleBuffer
export function getFrom <A, B> (b: ResampleBuffer<A, B>): Get<B> {
  return (): Maybe<Event<B>> => {
    const [value, next] = b.get()
    b = next
    return value
  }
}

// Expose a restricted mutable interface that only allows
// putting to a ResampleBuffer
export function putTo <A, B> (b: ResampleBuffer<A, B>): Put<A> {
  return (e: Event<A>): void => {
    b = b.put(e)
  }
}
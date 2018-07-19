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

// Expose a restricted mutable interface that only allows
// getting from a ResampleBuffer
export function getFrom <A, B> (b: ResampleBuffer<A, B>): (() => Maybe<Event<B>>) {
  return (): Maybe<Event<B>> => {
    const [value, next] = b.get()
    b = next
    return value
  }
}

// Expose a restricted mutable interface that only allows
// putting to a ResampleBuffer
export function putTo <A, B> (b: ResampleBuffer<A, B>): ((e: Event<A>) => void) {
  return (e: Event<A>): void => {
    b = b.put(e)
  }
}
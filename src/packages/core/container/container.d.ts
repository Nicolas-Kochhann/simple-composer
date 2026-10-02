import { ResolvedProvider } from "../provider/provider.js";

/**
 * Type of a composed container, with each registry entry replaced by its
 * resolved value and hidden entries omitted.
 *
 * Properties are read-only and resolved lazily on each read. If every entry is
 * hidden, the type resolves to `{}`.
 *
 * @typeParam T The registry used to derive the container properties.
 *
 * @example
 * ```ts
 * const container = Composer.create()
 *     .register({ secret: { factory: () => 'x', hidden: true } })
 *     .register({ api: ({ secret }) => new Api(secret) })
 *     .compose();
 *
 * container.api;    // Api
 * container.secret; // type error (still readable at runtime)
 * ```
 */
export type ComposedContainer<T> = {
    readonly [K in keyof T as T[K] extends { hidden: true } ? never : K]: ResolvedProvider<T[K]>
}
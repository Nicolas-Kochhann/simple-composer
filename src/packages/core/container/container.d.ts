import { ResolvedProvider } from "../provider/provider.js";

/**
 * Type of a composed container, with each registry entry replaced by its
 * resolved value and hidden entries omitted.
 *
 * @typeParam T The registry used to derive the container properties.
 */
export type ComposedContainer<T> = {
    readonly [K in keyof T as T[K] extends { hidden: true } ? never : K]: ResolvedProvider<T[K]>
}
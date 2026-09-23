import { Registry } from "../composer/composer.js";

/**
 * Creates a dependency value from the current container.
 *
 * @typeParam T The value produced by the factory.
 */
/** Creates a dependency value from the current container. */
export type Factory<TRegistry, TValue = unknown> = (
    container: DependencyContainer<TRegistry>
) => TValue;

/** Container-like object available to dependency factories for injection. */
/** Container available to dependency factories for injection. */
export type DependencyContainer<T> = {
    readonly [K in keyof T]: ResolvedProvider<T[K]>
};

/** Resolves a registry entry to the value exposed by the composed container. */
export type ResolvedProvider<T> = T extends Factory<any, infer R>
    ? R
    : T extends Registry<any, infer R>
        ? R
        : never;
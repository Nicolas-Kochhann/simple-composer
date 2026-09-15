import { Registry } from "../composer/composer.js";

/**
 * Creates a dependency value from the current container.
 *
 * @typeParam T The value produced by the factory.
 */
export type Factory<T = unknown> = (container: DependencyContainer) => T;

/** Container-like object available to dependency factories for injection. */
export type DependencyContainer = {
    [key: string]: unknown
};

/** Resolves a registry entry to the value exposed by the composed container. */
export type ResolvedProvider<T> = T extends Factory
    ? ReturnType<T>
    : T extends Registry<infer R>
        ? R
        : never;
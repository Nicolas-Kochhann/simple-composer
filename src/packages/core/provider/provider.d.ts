import { Registry } from "../composer/composer.js";

/**
 * Function that creates a dependency value.
 *
 * It receives the dependency container, so it can read any entry registered
 * before it (including `hidden` ones). Reading an entry runs its factory, or
 * returns the cached value if that entry is a singleton.
 *
 * @typeParam TRegistry The registry whose entries are available for injection.
 * @typeParam TValue The value produced by the factory.
 *
 * @example
 * ```ts
 * Composer.create()
 *     .register({ config: () => ({ port: 3000 }) })
 *     .register({ server: ({ config }) => new Server(config.port) });
 * ```
 */
export type Factory<TRegistry, TValue = unknown> = (
    container: DependencyContainer<TRegistry>
) => TValue;

/**
 * Read-only view of the registry passed to factories for injection.
 *
 * Unlike {@link ComposedContainer}, hidden entries are included.
 * Properties are resolved lazily when read.
 *
 * @typeParam T The registry whose entries are exposed.
 */
export type DependencyContainer<T> = {
    readonly [K in keyof T]: ResolvedProvider<T[K]>
};

/**
 * Resolves a registry entry to the value exposed by the container.
 *
 * A factory resolves to its return type; a provider configuration
 * (`{ factory, singleton?, hidden? }`) resolves to its factory's return type.
 *
 * @typeParam T A registry entry: a {@link Factory} or a {@link Registry}.
 */
export type ResolvedProvider<T> = T extends Factory<any, infer R>
    ? R
    : T extends Registry<any, infer R>
        ? R
        : never;
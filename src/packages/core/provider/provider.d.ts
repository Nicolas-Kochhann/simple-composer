import { Registry } from "../composer/composer.js";

export type Factory<T = unknown> = (container: DependencyContainer) => T;

export type DependencyContainer = {
    [key: string]: unknown
};

export type ResolvedProvider<T> = T extends Factory
    ? ReturnType<T>
    : T extends Registry<infer R>
        ? R
        : never;
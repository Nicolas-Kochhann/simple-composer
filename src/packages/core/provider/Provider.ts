import { DependencyContainer, Factory } from "./provider.js";

/**
 * Stores a dependency factory and resolves its value on demand.
 *
 * Providers are transient by default: the factory runs on every
 * {@link Provider.resolve | resolve()} call. When `singleton` is enabled, the
 * first result is cached and reused.
 *
 * @typeParam TRegistry The registry whose entries the factory can inject.
 * @typeParam TValue The value returned by the provider's factory.
 */
export class Provider<TRegistry, TValue>
{
    private _instance?: TValue;
    private _factory: Factory<TRegistry, TValue>;
    private _singleton: boolean;
    private _hidden: boolean;
    private _initialized = false;

    /**
     * Creates a provider.
     *
     * @param factory Function used to create the dependency value.
     * @param singleton Whether to cache and reuse the first resolved value.
     * @param hidden Whether the provider is hidden from the composed container's public type.
     * This is type-level only; the value stays readable at runtime and injectable into factories.
     */
    constructor(
        factory: Factory<TRegistry, TValue>,
        singleton: boolean,
        hidden: boolean
    )
    {
        this._factory = factory;
        this._singleton = singleton;
        this._hidden = hidden;
    }

    /**
     * Resolves the dependency using the supplied container for injection.
     *
     * @remarks
     * - Transient providers call the factory on every invocation.
     * - Singleton providers call the factory once and cache the result, including
     *   falsy values, `null` and `undefined`.
     * - If the factory throws, nothing is cached and the next call retries.
     *
     * @param container Container passed to the factory for dependency injection.
     * @returns The newly created value, or the cached value for a singleton provider.
     * @throws Rethrows, unchanged, any error thrown by the factory. Circular
     * dependencies are not detected and overflow the stack with a `RangeError`.
     */
    public resolve(container: DependencyContainer<TRegistry>): TValue
    {
        if (this._singleton){
            if(this._initialized) return this._instance as TValue;
            
            this._instance = this._factory(container);
            this._initialized = true;
            return this._instance!;
        }

        return this._factory(container);
    }
}
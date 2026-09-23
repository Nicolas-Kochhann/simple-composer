import { DependencyContainer, Factory } from "./provider.js";

/**
 * Stores a dependency factory and resolves its value on demand.
 *
 * @typeParam T The value returned by the provider's factory.
 */
export class Provider<TRegistry, TValue>
{
    private _instance?: TValue;
    private _factory: Factory<TRegistry, TValue>;
    private _singleton: boolean;
    private _hidden: boolean;

    /**
     * Creates a provider.
     *
     * @param factory Function used to create the dependency value.
     * @param singleton Whether to cache and reuse the first resolved value.
     * @param hidden Whether the provider is hidden from the composed container's public type.
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
     * @param container Container passed to the factory for dependency injection.
     * @returns The newly created value, or the cached value for a singleton provider.
     */
    public resolve(container: DependencyContainer<TRegistry>): TValue
    {
        if (this._singleton){
            if(this._instance !== undefined) return this._instance;
            
            this._instance = this._factory(container);
            return this._instance!;
        }

        return this._factory(container);
    }
}
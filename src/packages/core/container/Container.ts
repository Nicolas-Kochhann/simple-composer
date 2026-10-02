import { UncomposedProvider } from "../composer/composer.js";
import { Provider } from "../provider/Provider.js";

/**
 * Runtime container that resolves providers when its properties are read.
 *
 * Not meant to be constructed directly; use `Composer.compose()`.
 *
 * @typeParam T The registry the container's providers belong to.
 */
export class Container<T>
{
    [key: string]: Provider<T, unknown>;
    
    /**
     * Creates a container from uncomposed providers.
     *
     * The returned object is backed by a proxy, so reading a provider property
     * resolves and returns its value rather than the provider itself.
     *
     * @remarks
     * - Reading an unregistered key (or a symbol) returns `undefined`.
     * - Reading an unregistered key that exists on `Object.prototype`
     *   (e.g. `toString`) throws a `TypeError`.
     * - Assigning any property throws an `Error`; the container is read-only.
     * - Hidden providers are still readable at runtime; `hidden` only affects types.
     *
     * @param uncomposedProviders Providers and their registry keys.
     */
    constructor(uncomposedProviders: UncomposedProvider<T>[] )
    {
       for(const uncomposedProvider of uncomposedProviders){
            const { key, provider } = uncomposedProvider;
            this[key] = provider;
       }

       return Container.createProxy(this);
    }

    /** Wraps the container so reads resolve providers and writes are rejected. */
    private static createProxy<T>(container: Container<T>): Container<T>
    {
        return new Proxy(container, {
            get(container, key: keyof typeof container | string | symbol, receiver){
                if (key in container){
                    return (container as any)[key].resolve(receiver);
                }

                return undefined as never;
            },
            set(): never
            {
                throw new Error("You can't set a value to a container provider");
            }
        });
    }
}
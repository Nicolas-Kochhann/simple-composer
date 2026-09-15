import { UncomposedProvider } from "../composer/composer.js";
import { Provider } from "../provider/Provider.js";

/**
 * Runtime container that resolves providers when its properties are read.
 *
 * @typeParam T The type of the values produced by the container's providers.
 */
export class Container<T>
{
    [key: string]: Provider<T>;
    
    /**
     * Creates a container from uncomposed providers.
     *
     * The returned object is backed by a proxy, so reading a provider property
     * resolves and returns its value rather than the provider itself.
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

    private static createProxy<T>(container: Container<T>): Container<T>
    {
        return new Proxy(container, {
            get(container, key: keyof typeof container | string | symbol, receiver){
                if (key in container){
                    return (container as any)[key].resolve(receiver);
                }

                return key as never;
            },
            set(): never
            {
                throw new Error("You can't set a value to a container provider");
            }
        });
    }
}
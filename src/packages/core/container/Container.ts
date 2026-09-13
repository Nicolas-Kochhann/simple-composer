import { UncomposedProvider } from "../composer/composer.js";
import { Provider } from "../provider/Provider.js";

export class Container<T>
{
    [key: string]: Provider<T>;
    
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
            set(container, key: keyof typeof container | string | symbol): never
            {
                throw new Error("You can't set a value to a container provider");
            }
        });
    }
}
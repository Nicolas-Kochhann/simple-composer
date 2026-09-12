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
    }

    private createProxy(): Container<T>
    {
        return new Proxy(this, {
            get(container, key: keyof typeof container | string | symbol){
                if (key in container){
                    return (container as any)[key];
                }

                return key as never;
            }
        });
    }
}
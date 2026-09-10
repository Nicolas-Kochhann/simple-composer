import { Provider } from "../provider/Provider.js";

export class Container 
{
    [key: string]: Provider<T>;
    
    constructor(providers: Provider<T>[]){
        return new Proxy(this, {
            get(container, key: string){
                if (key in container){
                    return container[key];
                }

                return never;
            },
        });
    }

    createProperty(factory: Factory<T>, singleton)

}
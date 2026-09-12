import { Provider } from "../provider/Provider.js";

export class Container<T>
{
    [key: string]: Provider<T>;
    
    constructor(providers: Provider<unknown>[]){
       for(const provider of providers){

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
import { Provider } from "../provider/Provider.js";

export class Container 
{
    [key: string]: Provider<T>;
    
    constructor(providers: Provider<T>[]){
        

        return new Proxy(this, () => {

        })
    }

    createProperty(factory: Factory<T>, singleton)

}
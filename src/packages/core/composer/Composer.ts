import { Container } from "../container/Container.js";
import { Factory } from "../provider/provider.js";
import { Provider } from "../provider/Provider.js";
import { RegisterObject, UncomposedProvider } from "./composer.js";

export class Composer<T extends RegisterObject>
{
    private _registerObject: T;

    constructor(registerObject: T)
    {
        this._registerObject = registerObject;
    }

    public compose(): Container<T>
    {
        const providers: UncomposedProvider<T>[] = [];

        for(const key in this._registerObject){
            let factory: Factory<unknown>;
            let isSingleton = false;
            let isHidden = false;

            if(typeof this._registerObject[key] !== 'function'){
                factory = this._registerObject[key].factory;

                if(this._registerObject[key].singleton) isSingleton = true;
                if(this._registerObject[key].hidden) isHidden = true;
            } else {
                factory = this._registerObject[key];
            }

            const provider = new Provider<ReturnType<typeof factory>>(factory, isSingleton, isHidden);
            providers.push({ key: key, provider: provider });
        }

        return new Container<T>(providers);
    }
}
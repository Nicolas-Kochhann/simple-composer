import { ComposedContainer } from "../container/container.js";
import { Container } from "../container/Container.js";
import { Factory } from "../provider/provider.js";
import { Provider } from "../provider/Provider.js";
import { RegisterObject, UncomposedProvider } from "./composer.js";

/**
 * Converts a dependency registry into a lazily resolved container.
 *
 * @typeParam T The registry shape used to infer the composed container.
 */
export class Composer<T extends RegisterObject>
{
    private _registerObject: T;

    /**
     * Creates a composer for the provided dependency registry.
     *
     * @param registerObject Dependency factories and provider configurations.
     */
    constructor(registerObject: T)
    {
        this._registerObject = registerObject;
    }

    /**
     * Composes the registry into a container.
     *
     * Providers are resolved lazily when their corresponding container
     * properties are accessed. The returned type exposes resolved values and
     * omits providers configured with `hidden: true`.
     *
     * @returns A container whose properties are resolved dependency values.
     */
    public compose(): ComposedContainer<T>
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

        return new Container(providers) as ComposedContainer<T>;
    }
}
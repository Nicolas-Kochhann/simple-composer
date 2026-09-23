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
export class Composer<T extends RegisterObject<any> = {}>
{
    private _registerObject: T = {} as T;

    /**
     * Creates a composer for the provided dependency registry.
     *
     * @param registerObject Dependency factories and provider configurations.
     */
    private constructor(registerObject: T)
    {
        this._registerObject = registerObject;
    }

    public static create(): Composer
    {
        return new Composer({});
    }

    public register<const R extends Record<string, Factory<T, any> | {
            factory: Factory<T, any>;
            singleton?: boolean;
            hidden?: boolean;
        }>>(registration: R): Composer<T & R>
    {
        const registerObject = {
            ...this._registerObject,
            ...registration
        } as T & R;

        return new Composer(registerObject);
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
            let factory: Factory<T, unknown>;
            let isSingleton = false;
            let isHidden = false;

            if(typeof this._registerObject[key] !== 'function'){
                factory = this._registerObject[key].factory;

                if(this._registerObject[key].singleton) isSingleton = true;
                if(this._registerObject[key].hidden) isHidden = true;
            } else {
                factory = this._registerObject[key];
            }

            const provider = new Provider<T, ReturnType<typeof factory>>(
                factory,
                isSingleton,
                isHidden
            );
            providers.push({ key: key, provider: provider });
        }

        return new Container(providers) as ComposedContainer<T>;
    }
}
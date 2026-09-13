import { DependencyContainer, Factory } from "./provider.js";

export class Provider<T>
{
    private _instance?: T;
    private _factory: Factory<T>;
    private _singleton: boolean;
    private _hidden: boolean;

    constructor(factory: Factory<T>, singleton: boolean, hidden: boolean)
    {
        this._factory = factory;
        this._singleton = singleton;
        this._hidden = hidden;
    }

    public resolve(container: DependencyContainer): T 
    {
        if (this._singleton){
            if(this._instance) return this._instance;
            
            this._instance = this._factory(container);
            return this._instance!;
        }

        return this._factory(container);
    }
}
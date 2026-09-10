import { Factory } from "./provider";

export class Provider<T>
{
    private _instance?: T;
    private _factory: Factory<T>;
    private _singleton: boolean;

    constructor(factory: Factory<T>, singleton: boolean)
    {
        this._factory = factory;
        this._singleton = singleton;
    }

    public resolve(): T 
    {
        if (this._singleton){
            if(this._instance) return this._instance;
            
            this._instance = this._factory();
            return this._instance;
        }

        return this._factory();
    }
}
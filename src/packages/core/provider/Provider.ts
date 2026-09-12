import { Factory } from "./provider";

export class Provider<T>
{
    private _instance?: T;
    private _key: string;
    private _factory: Factory<T>;
    private _singleton: boolean;
    private _hidden: boolean;

    constructor(key: string, factory: Factory<T>, singleton: boolean, hidden: boolean)
    {
        this._key = key;
        this._factory = factory;
        this._singleton = singleton;
        this._hidden = hidden;
    }

    public resolve(): T 
    {
        if (this._singleton){
            if(this._instance) return this._instance;
            
            this._instance = this._factory();
            return this._instance!;
        }

        return this._factory();
    }
}
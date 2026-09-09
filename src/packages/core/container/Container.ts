export class Container 
{
    // private providers: Map<any, Provider<any>>;
    private _instances: Map<any, object>;

    constructor(){}

    // constructor(composer: Composer)
    // {
    //     composer
    // };

    public get instances(): <T>[]
    {
        return Array.from(this._instances.values());
    }
    
}
import { Factory } from "./provider";

export class Provider<T>
{
    private factory: Factory;
    private dependencies: Dependency[];

    constructor(factory: Factory)
    {
        this.factory = factory;
        this.dependencies = factory.arguments
    }

    public resolve<T>(): T
    {
        return this.factory();
    }
}
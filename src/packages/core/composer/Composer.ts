import { Container } from "../container/Container.js";
import { RegisterObject } from "./composer.js";

export class Composer 
{
    private _registerObject: RegisterObject;

    constructor(registerObject: RegisterObject){
        this._registerObject = registerObject;
    }

    public compose(): Container
    {
        const providers = [];

        for(const key in this._registerObject){
            provider[key] = this._registerObject[key];
            providers.push(provider);
        }

        return new Container(providers);
    }
}
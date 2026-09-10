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
        for(const value of this._registerObject){
            
        }
    }
}
import { Composer } from "../src/packages/core/composer/Composer";

class FunctionCallingService
{
    constructor(
        private readonly callableFunction: () => void
    ){}

    public execute(){
        this.callableFunction();
    }
}

const composer = new Composer({
    myLittleFunction: () => {
        return () => { console.log('Greetings!!!') }
    },

    functionCallingService: ({ myLittleFunction }) => new FunctionCallingService(myLittleFunction as any)
});

const container = composer.compose();

container.myLittleFunction();

container.functionCallingService.execute();
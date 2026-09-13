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
    myLittleFunction: {
        factory: () => {
            return () => { console.log('Greetings!!!') }
        },
        singleton: false,
        hidden: true
    },

    functionCallingService: ({ myLittleFunction }) => new FunctionCallingService(myLittleFunction as any)
});

const container = composer.compose();
container.functionCallingService.execute();
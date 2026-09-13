import { Composer } from "../src/packages/core/composer/Composer.js";

const container = new Composer({
    database: () => ({ connect() {} }),
    config: () => ({ port: 3000 }),
    junior: {
        factory: () => ({ name: 'Nícolas Kochhann' }),
        singleton: true,
        hidden: false
    }
}).compose();

console.log(container.junior.name);
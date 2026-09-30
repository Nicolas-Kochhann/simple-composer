import { test, suite } from "node:test";
import assert from "node:assert/strict";

// @ts-ignore -- test tsconfig rootDir is restricted to /tests
import { Composer } from './../../src/packages/core/composer/Composer.js';

class DB {
    constructor(private host: string, private port: number){}
    public getHost(): string { return this.host }
}

suite('Container resolution', () => {

    test('Reading a registered property invokes its factory.', (t) => {
        const factory = t.mock.fn(() => new DB('localhost', 1234));
        const container = Composer.create().register({ db: factory }).compose();

        assert(container.db instanceof DB && container.db.getHost() === "localhost");
        assert.strictEqual(factory.mock.calls.length, 2);
    });

    test('A factory receives the composed container as its dependency argument.', (t) => {
        const factory = t.mock.fn(({ config }) => new DB(config.host, 1234));
        const container = Composer.create()
            .register({ config: () => ({ host: 'localhost' }) })
            .register({ db: factory })
            .compose();

        assert(container.db.getHost() === "localhost");
        assert.strictEqual(factory.mock.calls.length, 1);
    });

    test('A factory resolves an earlier registered dependency through that argument.', (t) => {
        const factory = t.mock.fn((container: any) => new DB(container.config.host, 1234));
        const container = Composer.create()
            .register({ config: () => ({ host: 'localhost' }) })
            .register({ db: factory })
            .compose();

        assert(container.db.getHost() === "localhost");
        assert.strictEqual(factory.mock.calls.length, 1);
    });

    test('Resolve a multi-level dependency chain.', (t) => {
        const factoryA = t.mock.fn(() => ({ host: 'localhost' }));
        const factoryB = t.mock.fn(({ config }) => new DB(config.host, 1234));
        const container = Composer.create()
            .register({ config: factoryA })
            .register({ db: factoryB })
            .compose();

        assert(container.db.getHost() === "localhost");
        assert.strictEqual(factoryA.mock.calls.length, 1);
        assert.strictEqual(factoryB.mock.calls.length, 1);
    });

    test('Verify direct property access and bracket notation behave consistently.', (t) => {
        const factory = t.mock.fn(() => new DB('localhost', 1234));
        const container = Composer.create().register({ db: factory }).compose();

        assert(container.db instanceof DB && container.db.getHost() === "localhost");
        assert(container['db'] instanceof DB && container['db'].getHost() === "localhost");
        assert.strictEqual(factory.mock.calls.length, 4);
    });
    
    test('Verify a transient dependency is recreated on every read.', (t) => {
        const factory = t.mock.fn(() => new DB('localhost', 1234));
        const container = Composer.create().register({ db: factory }).compose();

        assert(container.db instanceof DB && container.db.getHost() === "localhost");
        assert(container.db instanceof DB && container.db.getHost() === "localhost");
        assert.strictEqual(factory.mock.calls.length, 4);
    });

    test('Verify a singleton dependency is shared by multiple dependent factories.', (t) => {
        const factory = t.mock.fn(() => new DB('localhost', 1234));
        const container = Composer.create()
            .register({
                db: {
                    factory: factory,
                    singleton: true
                }
            })
            .register({
                serviceA: ({ db }) => db,
                serviceB: ({ db }) => db
            })
            .compose();

        assert(container.serviceA instanceof DB && container.serviceA.getHost() === "localhost");
        assert(container.serviceB instanceof DB && container.serviceB.getHost() === "localhost");
        assert.strictEqual(factory.mock.calls.length, 1);
    });

    test('Setting a container property throws You can\'t set a value to a container provider.', (t) => {
        const container = Composer.create()
            .register({ config: () => ({ host: 'localhost' }) })
            .compose();

        assert.throws(() => {
            (container as any).config = { host: 'new-host' };
        }, /You can't set a value to a container provider/);
    });

    test('Accessing an unregistered property follows the intended contract.', (t) => {
        const container = Composer.create().compose();

        // @ts-ignore to avoid TypeScript error on unexisting property access
        assert.strictEqual(container.unregisteredProperty, undefined);
    });
    
    test('Factory exceptions propagate without being swallowed.', (t) => {
        const factory = t.mock.fn(() => { throw new Error('Factory error'); });
        const container = Composer.create().register({ db: factory }).compose();

        assert.throws(() => {
            container.db;
        }, /Factory error/);
    });
});
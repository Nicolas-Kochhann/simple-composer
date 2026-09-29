import { test, suite } from "node:test";
import assert from "node:assert/strict";

// @ts-ignore -- test tsconfig rootDir is restricted to /tests
import { Composer } from './../../src/packages/core/composer/Composer.js';
import { Container } from "../../src/packages/core/container/Container.js";

class DB {
    constructor(private host: string, private port: number){}
    public getHost(): string { return this.host }
}

suite('Composer.create()', () => {
    
    test('Create an empty composer successfully.', () => {
        const composer = Composer.create();

        assert(composer instanceof Composer);
        assert.deepStrictEqual({ ...composer } , { _registerObject: {} });
    });

    test('Compose an empty composer successfully.', () => {
        const composer = Composer.create();
        const container = composer.compose();

        assert(container instanceof Container);
        assert.deepStrictEqual({ ...container }, {});
    });

    test('Verify that the resulting container can be read without eagerly invoking any factory.', (t) => {
        const factory = t.mock.fn(() => new DB('localhost', 1234));

        const container = Composer.create()
            .register({ db: factory })
            .compose();

        assert.strictEqual(factory.mock.calls.length, 0);

        const db = container.db;

        assert.strictEqual(factory.mock.calls.length, 1);
        assert(db instanceof DB);
    });
})

suite('Composer.register()', () => {

    test('Register a single direct factory.', () => {
        const factory = () => new DB('localhost', 1234);
        const composer = Composer.create().register({ db: factory });

        assert(composer instanceof Composer);
        assert.deepStrictEqual({ ...composer }, { _registerObject: { db: factory } });
    });

    test('Register multiple entries through chained calls.', () => {
        const factoryA = () => ({ host: "localhost", port: 1234 });
        const factoryB = () => new DB('localhost', 1234);

        const composer = Composer.create().register({ config: factoryA }).register({ db: factoryB });

        assert.deepStrictEqual({ ...composer }, { _registerObject: { config: factoryA, db: factoryB } });
    });

    test('Register a configured provider with factory, singleton, and hidden options.', () => {
        const factory = () => new DB('localhost', 1234);

        const composer = Composer.create().register({
            db: {
                factory: factory,
                singleton: true,
                hidden: true
            }
        });

        assert.deepStrictEqual(
            { ...composer },
            {
                _registerObject: {
                    db: {
                        factory: factory,
                        singleton: true,
                        hidden: true
                    }
                }
            }
        );
    })

    test('Verify each call returns a new composer and does not mutate the previous composer.', () => {
        const configFactory = () => ({ host: 'localhost' });
        const dbFactory = () => new DB('localhost', 1234);

        const composerA = Composer.create().register({ config: configFactory });
        const composerB = composerA.register({ db: dbFactory });

        assert.notStrictEqual(composerA, composerB);
        assert.deepStrictEqual({ ...composerA }, { _registerObject: { config: configFactory } });
        assert.deepStrictEqual({ ...composerB }, { _registerObject: { config: configFactory, db: dbFactory } });
    })

    test('Verify registration order is preserved for dependency injection and type inference.', () => {
        const container = Composer.create()
            .register({ config: () => ({ host: 'localhost', port: 1234 }) })
            .register({ db: ({ config }) => new DB(config.host, config.port) })
            .compose();

        assert(container.db instanceof DB);
        assert.strictEqual(container.db.getHost(), 'localhost');
    });

    test('Define and test the behavior when a later registration reuses an earlier key.', () => {
        const firstFactory = () => new DB('first-host', 1111);
        const secondFactory = () => new DB('second-host', 2222);

        const composer = Composer.create()
            .register({ db: firstFactory })
            .register({ db: secondFactory });

        assert.deepStrictEqual({ ...composer }, { _registerObject: { db: secondFactory } });

        const container = composer.compose();

        assert.strictEqual(container.db.getHost(), 'second-host');
    });
})

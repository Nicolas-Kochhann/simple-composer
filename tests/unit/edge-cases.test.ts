import { test, suite } from "node:test";
import assert from "node:assert/strict";

// @ts-ignore -- test tsconfig rootDir is restricted to /tests
import { Composer } from './../../src/packages/core/composer/Composer.js';

class DB {
    constructor(private host: string, private port: number){}
    public getHost(): string { return this.host }
}

suite('Edge cases', () => {
    
    test('Empty composer produces an empty container.', () => {
        const container = Composer.create().compose();

        assert.deepStrictEqual({ ...container }, {});
    });

    test('Single-entry composer resolves normally.', () => {
        const container = Composer.create()
            .register({ db: () => new DB('localhost', 1234) })
            .compose();

        assert(container.db instanceof DB && container.db.getHost() === 'localhost');
    });

    test('Current behavior: duplicate keys across successive register() calls, last one wins.', () => {
        const container = Composer.create()
            .register({ db: () => new DB('first-host', 1111) })
            .register({ db: () => new DB('second-host', 2222) })
            .compose();

        assert.strictEqual(container.db.getHost(), 'second-host');
    });

    test('Current behavior: a registered key named "toString" resolves the registered factory, not the inherited method.', () => {
        const container = Composer.create()
            // @ts-ignore -- registering a key that collides with an inherited Object member
            .register({ toString: () => 'custom-value' })
            .compose();

        assert.strictEqual(container.toString, 'custom-value');
    });

    test('Current behavior: a registered key named "constructor" resolves the registered factory, not the class constructor.', () => {
        const container = Composer.create()
            // @ts-ignore -- registering a key that collides with an inherited Object member
            .register({ constructor: () => 'custom-value' })
            .compose();

        assert.strictEqual(container.constructor, 'custom-value');
    });

    test('Current behavior: accessing an unregistered symbol property returns undefined; symbol keys are not part of the supported API.', () => {
        const container = Composer.create().compose();
        const sym = Symbol('unregistered');

        // @ts-ignore -- symbol keys are not part of the typed registry API
        assert.strictEqual(container[sym], undefined);
    });

    // TODO: Solve this in composing time. Register objects with circular dependency declarations should not compose.
    test('Current behavior: circular dependencies overflow the call stack rather than producing a descriptive error.', () => {
        const container = Composer.create()
            .register({
                a: ({ b }: any) => b,
                b: ({ a }: any) => a
            } as any)
            .compose();

        assert.throws(() => container.a, RangeError);
    });

    // TODO: Solve this on composing time. Register objects with self-dependency declaration should not compose.
    test('Current behavior: a self-dependency overflows the call stack rather than producing a descriptive error.', () => {
        const container = Composer.create()
            .register({ a: ({ a }: any) => a })
            .compose();

        assert.throws(() => container.a, RangeError);
    });

    test('Current behavior: an invalid registration entry is not validated at register() time, and fails at compose() call.', () => {
        const composer = Composer.create()
            // @ts-ignore -- intentionally registering a malformed entry (not a factory or provider config)
            .register({ db: 'not-a-factory' });

        assert.throws(() => composer.compose(), TypeError);
    });
});
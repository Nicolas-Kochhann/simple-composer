import { test, suite } from "node:test";
import assert from "node:assert/strict";

import { Provider } from "../../src/packages/core/provider/Provider.js";
// @ts-ignore -- test tsconfig rootDir is restricted to /tests
import { Composer } from './../../src/packages/core/composer/Composer.js';

suite('Provider', () => {

    test('Direct factory entries are transient by default.', (t) => {
        const factory = t.mock.fn(() => ({}));
        const container = Composer.create().register({ value: factory }).compose();

        container.value;
        container.value;

        assert.strictEqual(factory.mock.calls.length, 2);
    });

    test('A transient provider invokes its factory on every resolution.', (t) => {
        const factory = t.mock.fn(() => ({}));
        const provider = new Provider<any, any>(factory, false, false);

        provider.resolve({});
        provider.resolve({});
        provider.resolve({});

        assert.strictEqual(factory.mock.calls.length, 3);
    });

    test('A singleton provider invokes its factory only on the first resolution.', (t) => {
        const factory = t.mock.fn(() => ({}));
        const provider = new Provider<any, any>(factory, true, false);

        provider.resolve({});
        provider.resolve({});
        provider.resolve({});

        assert.strictEqual(factory.mock.calls.length, 1);
    });

    test('A singleton returns the exact same object on subsequent resolutions.', () => {
        const provider = new Provider<any, any>(() => ({ id: Math.random() }), true, false);

        const first = provider.resolve({});
        const second = provider.resolve({});

        assert.strictEqual(first, second);
    });

    test('Singleton caching works for 0, false, and "".', (t) => {
        for (const value of [0, false, ""]) {
            const factory = t.mock.fn(() => value);
            const provider = new Provider<any, any>(factory, true, false);

            const first = provider.resolve({} as any);
            const second = provider.resolve({} as any);

            assert.strictEqual(first, value);
            assert.strictEqual(second, value);
            assert.strictEqual(
                factory.mock.calls.length,
                1,
                `Expected factory returning ${JSON.stringify(value)} to be cached, but it was called ${factory.mock.calls.length} times.`
            );
        }
    });

    test('Current behavior: a singleton factory returning undefined is not re-invoked on every resolution.', (t) => {
        const factory = t.mock.fn(() => undefined);
        const provider = new Provider<any, any>(factory, true, false);

        provider.resolve({});
        provider.resolve({});

        assert.strictEqual(factory.mock.calls.length, 1);
    });

    test('Current behavior: a singleton factory returning null is cached like any other value.', (t) => {
        const factory = t.mock.fn(() => null);
        const provider = new Provider<any, any>(factory, true, false);

        provider.resolve({});
        provider.resolve({});

        assert.strictEqual(factory.mock.calls.length, 1);
    });

    test('Factory exceptions propagate.', () => {
        const provider = new Provider<any, any>(() => { throw new Error('Factory error'); }, false, false);

        assert.throws(() => provider.resolve({}), /Factory error/);
    });

    test('A failed singleton factory call does not cache a partially created value.', (t) => {
        let attempt = 0;
        const factory = t.mock.fn(() => {
            attempt++;
            if (attempt === 1) throw new Error('First attempt fails');
            return { attempt };
        });
        const provider = new Provider<any, any>(factory, true, false);

        assert.throws(() => provider.resolve({}), /First attempt fails/);

        const result = provider.resolve({});

        assert.deepStrictEqual(result, { attempt: 2 });
        assert.strictEqual(factory.mock.calls.length, 2);
    });
});

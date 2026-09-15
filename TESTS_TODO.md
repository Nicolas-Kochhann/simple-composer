# Tests TODO

This document describes the test coverage needed for `simple-composer`. It separates runtime behavior from TypeScript compile-time behavior so that passing unit tests cannot hide broken public types.

## Current state

- `tests/unit/` and `tests/types/` are currently empty.
- `tsx` is available, but no test runner or type-test assertion library is configured.
- The `npm test` script is still a placeholder and does not run the test suite.
- The main TypeScript configuration excludes `tests/`; add a dedicated test configuration or update it when tests are implemented.

## Unit tests

### Priority 1 — core behavior

#### `Composer.compose()`

Suggested file: `tests/unit/composer.test.ts`

- [ ] Compose an empty registry successfully.
- [ ] Compose a registry containing one direct factory.
- [ ] Compose multiple direct factories.
- [ ] Compose configured providers with `singleton` and `hidden` flags.
- [ ] Verify `compose()` returns a working container.
- [ ] Verify factories are not called during composition.
- [ ] Verify each registry key is registered exactly once.

#### `Container` dependency resolution

Suggested file: `tests/unit/container.test.ts`

- [ ] Reading a registered property invokes its factory.
- [ ] A factory receives the composed container.
- [ ] A factory can resolve another provider through that container.
- [ ] Multi-level dependency chains resolve correctly.
- [ ] Direct property access and dynamic property access behave consistently.
- [ ] Accessing an unregistered key follows the intended contract. The current implementation returns the property key as a sentinel, so this behavior needs an explicit decision before asserting it.
- [ ] Setting a container property throws `You can't set a value to a container provider`.
- [ ] Factory exceptions propagate without being silently swallowed.

#### `Provider` lifecycle

Suggested file: `tests/unit/provider.test.ts`

- [ ] Providers are transient by default.
- [ ] A transient provider invokes its factory on every resolution.
- [ ] A singleton invokes its factory only on first resolution.
- [ ] A singleton returns the exact same instance on subsequent resolutions.
- [ ] Singleton caching works for falsy results such as `0`, `false`, and `""`; the current truthiness check is a likely defect.
- [ ] Decide and test whether `null` is a valid singleton result.
- [ ] Factory exceptions propagate and do not create a partially cached instance.

### Priority 2 — public features

#### Hidden providers

Suggested file: `tests/unit/hidden-providers.test.ts`

- [ ] A hidden provider can be resolved by another factory.
- [ ] Hidden providers retain their singleton/transient behavior.
- [ ] Public and hidden providers can coexist in one registry.
- [ ] Clarify whether hidden means type-only hiding or runtime hiding. The current implementation hides providers only from the public type; the proxy still resolves them at runtime.

#### Registry configuration

Suggested file: `tests/unit/registry-config.test.ts`

- [ ] Direct factory registration uses transient behavior by default.
- [ ] `{ factory, singleton: true, hidden: false }` behaves as documented.
- [ ] All meaningful `singleton`/`hidden` combinations are covered.
- [ ] Configuration values are respected independently of one another.
- [ ] Decide how missing fields and extra fields in a configuration object should behave before adding invalid-input tests.

#### Integration graph

Suggested file: `tests/unit/integration.test.ts`

- [ ] Resolve a realistic graph containing direct factories and configured providers.
- [ ] Mix singleton and transient services.
- [ ] Share a singleton across multiple dependent services.
- [ ] Include hidden infrastructure dependencies used by public services.
- [ ] Verify lazy resolution across the graph.

### Priority 3 — edge cases

Suggested file: `tests/unit/edge-cases.test.ts`

- [ ] Empty registry behavior.
- [ ] A single-provider registry.
- [ ] Provider names inherited from or colliding with object properties, if those keys are supported.
- [ ] Symbol property access, if symbol keys are part of the API.
- [ ] Self-dependencies and circular dependencies. First decide whether they should produce a descriptive error or remain unsupported.
- [ ] Invalid registry entries. First define the expected validation behavior.

## Type tests

Type tests should compile as a separate project and should not be treated as runtime tests. Use small assertion helpers such as `Equal` and `Expect`, plus `@ts-expect-error` for negative cases, or adopt `tsd` if a dedicated framework is preferred.

### Priority 1 — type inference

#### `ResolvedProvider`

Suggested file: `tests/types/resolved-provider.test.ts`

- [ ] A direct factory resolves to its return type.
- [ ] A configured registry resolves to the type returned by `factory`.
- [ ] Primitive, object, array, union, and generic return types are preserved.
- [ ] Invalid provider shapes resolve to the intended error type or are rejected by the surrounding registry constraint.

#### `ComposedContainer`

Suggested file: `tests/types/composed-container.test.ts`

- [ ] Registry keys are preserved in the composed container.
- [ ] Direct factory entries are public.
- [ ] Configured entries with `hidden: false` are public.
- [ ] Configured entries with `hidden: true` are excluded from `keyof` the public container.
- [ ] Public properties expose resolved values rather than `Provider` or factory objects.
- [ ] Public properties are readonly.
- [ ] An empty registry produces an empty public container type.
- [ ] An all-hidden registry produces no public provider keys.

#### `Composer<T>`

Suggested file: `tests/types/composer.test.ts`

- [ ] Valid direct-factory registries are accepted.
- [ ] Valid configured-provider registries are accepted.
- [ ] The registry's keys and resolved return types flow through `compose()`.
- [ ] Malformed registry values are rejected.
- [ ] Unsupported provider configuration shapes are rejected.

### Priority 2 — dependency typing and negative cases

#### Factory dependency typing

Suggested file: `tests/types/dependency-injection.test.ts`

- [ ] Verify the declared type of the factory parameter.
- [ ] Verify what type a factory receives when reading a dependency from `DependencyContainer`.
- [ ] Document whether dependency values are intentionally `unknown` or should be inferred from the complete registry.
- [ ] If registry-aware inference is intended, verify valid dependency access and reject misspelled or unregistered dependencies.
- [ ] Verify factory return types are inferred without explicit annotations.

The current `DependencyContainer` uses `[key: string]: unknown`, so these tests should expose the current limitation rather than assume stronger inference exists.

#### Negative type assertions

Suggested file: `tests/types/errors.test.ts`

- [ ] Accessing a hidden provider through the public container is rejected.
- [ ] Assigning to a public container property is rejected.
- [ ] Assigning a resolved dependency to an incompatible type is rejected.
- [ ] Invalid registry entries are rejected.
- [ ] Use `@ts-expect-error` only where the error is an intentional part of the API contract.

### Priority 3 — supported advanced types

- [ ] Test readonly and optional returned object members.
- [ ] Test unions and generic factory return values.
- [ ] Test unusual registry keys if they are supported by the runtime implementation.
- [ ] Add optional-provider tests only after optional providers are defined in the public API.

## Test infrastructure TODO

- [ ] Choose a runtime runner. Node's built-in test runner is the smallest dependency option; Vitest is a reasonable alternative.
- [ ] Add the selected runner or scripts to `package.json`.
- [ ] Replace the placeholder `npm test` script.
- [ ] Add a dedicated `tsconfig.tests.json` or otherwise include type tests without emitting library output.
- [ ] Add separate commands for unit tests and type tests.
- [ ] Add coverage reporting only after the core suite is stable.
- [ ] Add CI execution for both test categories.

## Suggested implementation order

1. Test infrastructure and working scripts.
2. `Composer`, `Container`, and `Provider` core unit tests.
3. Core `ResolvedProvider` and `ComposedContainer` type tests.
4. Hidden-provider and registry-configuration tests.
5. Dependency-injection typing tests.
6. Negative type tests and edge cases.
7. Integration and coverage reporting.

Fastify tests should wait until `src/packages/fastify/` contains an implementation. Performance tests are not needed until the runtime contract and type API are stable.

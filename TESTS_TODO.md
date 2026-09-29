# Tests TODO

This document tracks runtime and compile-time coverage for the current `simple-composer` API. The library now uses an immutable, fluent builder: `Composer.create()` creates an empty composer, `register()` adds entries and returns a new composer, and `compose()` creates a lazy container.

Runtime tests and TypeScript tests must remain separate. Passing runtime tests does not prove that the public type API is correct.

## Current state

- [ ] `tests/unit/` and `tests/types/` are currently empty.
- [ ] `tsx` is available, but no runtime test runner or type-test assertion library is configured.
- [ ] The `npm test` script is still a placeholder and does not run the suite.
- [ ] The main TypeScript configuration excludes `tests/`; add a dedicated test configuration before adding compile-time tests.
- [ ] `src/packages/fastify/` has no implementation, so Fastify coverage is out of scope for now.

## Runtime tests

### Priority 1 — builder and composition

Suggested file: `tests/unit/composer.test.ts`

#### `Composer.create()`

- [ ] Create an empty composer successfully.
- [ ] Compose an empty composer successfully.
- [ ] Verify that the resulting container can be read without eagerly invoking any factory.

#### `Composer.register()`

- [ ] Register a single direct factory.
- [ ] Register multiple entries through chained calls.
- [ ] Register a configured provider with `factory`, `singleton`, and `hidden` options.
- [ ] Verify each call returns a new composer and does not mutate the previous composer.
- [ ] Verify registration order is preserved for dependency injection and type inference.
- [ ] Define and test the behavior when a later registration reuses an earlier key.

#### `Composer.compose()`

- [ ] Return a working container for direct factories and configured providers.
- [ ] Verify composition creates providers but does not call factories.
- [ ] Verify every registered entry is represented exactly once in the composed container.
- [ ] Verify factories are resolved only when their container property is read.

### Priority 1 — container resolution

Suggested file: `tests/unit/container.test.ts`

- [ ] Reading a registered property invokes its factory.
- [ ] A factory receives the composed container as its dependency argument.
- [ ] A factory resolves an earlier registered dependency through that argument.
- [ ] Resolve a multi-level dependency chain.
- [ ] Verify direct property access and bracket notation behave consistently.
- [ ] Verify a transient dependency is recreated on every read.
- [ ] Verify a singleton dependency is shared by multiple dependent factories.
- [ ] Accessing an unregistered property follows the intended contract. The current proxy returns the property key as a sentinel; decide whether this behavior is public before asserting it.
- [ ] Setting a container property throws `You can't set a value to a container provider`.
- [ ] Factory exceptions propagate without being swallowed.

### Priority 1 — provider lifecycle

Suggested file: `tests/unit/provider.test.ts`

- [ ] Direct factory entries are transient by default.
- [ ] A transient provider invokes its factory on every resolution.
- [ ] A singleton provider invokes its factory only on the first resolution.
- [ ] A singleton returns the exact same object on subsequent resolutions.
- [ ] Singleton caching works for `0`, `false`, and `""`; the current `undefined`-based cache check is a likely defect for these values.
- [ ] Decide whether `null` and `undefined` are valid singleton results and test the chosen contract.
- [ ] Factory exceptions propagate.
- [ ] A failed singleton factory call does not cache a partially created value.

### Priority 2 — configuration and hidden providers

Suggested file: `tests/unit/provider-config.test.ts`

- [ ] Direct factory registration uses transient behavior by default.
- [ ] `{ factory, singleton: true }` enables singleton behavior without hiding the provider.
- [ ] `{ factory, hidden: true }` hides the provider from the public composed type but keeps it available at runtime.
- [ ] `{ factory, singleton: true, hidden: true }` combines both behaviors.
- [ ] Explicit `false` values are respected independently for `singleton` and `hidden`.
- [ ] Missing optional configuration fields use the documented defaults.
- [ ] Decide how extra configuration fields and malformed configuration objects should behave before adding invalid-input tests.

Suggested file: `tests/unit/hidden-providers.test.ts`

- [ ] A hidden provider can be resolved by another factory.
- [ ] Hidden providers retain transient and singleton behavior.
- [ ] Public and hidden providers coexist in one composed container.
- [ ] A hidden provider is omitted only from the public API type; verify the runtime proxy still resolves it for dependency injection.

### Priority 2 — integration graph

Suggested file: `tests/unit/integration.test.ts`

- [ ] Resolve a realistic graph containing direct factories and configured providers.
- [ ] Mix singleton and transient services.
- [ ] Share a singleton across multiple dependent services.
- [ ] Include hidden infrastructure dependencies used by public services.
- [ ] Verify the complete graph remains lazy until a public value is read.
- [ ] Verify exceptions identify the failing factory path sufficiently for debugging, if descriptive errors are part of the contract.

### Priority 3 — edge cases

Suggested file: `tests/unit/edge-cases.test.ts`

- [ ] Empty and single-entry composers.
- [ ] Duplicate keys registered in successive `register()` calls; define whether last registration wins or duplicates are rejected.
- [ ] Keys colliding with inherited object or proxy properties, if such keys are supported.
- [ ] Symbol property access, only if symbol keys become part of the supported API.
- [ ] Self-dependencies and circular dependencies; decide whether they should produce a descriptive error or remain unsupported.
- [ ] Invalid registration entries; define validation behavior before asserting failures.

## Type tests

Type tests should compile as a separate project and should not emit library output. Use small `Equal`/`Expect` helpers with `@ts-expect-error`, or adopt a dedicated tool such as `tsd`.

### Priority 1 — registry and resolved-value types

Suggested file: `tests/types/provider-types.test.ts`

#### `ResolvedProvider`

- [ ] A direct factory resolves to its return type.
- [ ] A configured registry entry resolves to the return type of `factory`.
- [ ] Primitive, object, array, union, readonly, optional, and generic return types are preserved.
- [ ] Unsupported provider shapes are rejected by the registration constraint.

#### `RegisterObject` and `Registry`

- [ ] Direct factory entries are accepted.
- [ ] Configured provider entries are accepted.
- [ ] Optional `singleton` and `hidden` flags are accepted as booleans.
- [ ] Missing `factory` and invalid `factory` values are rejected.
- [ ] Unsupported configuration properties are handled according to the chosen excess-property contract.

### Priority 1 — fluent composer inference

Suggested file: `tests/types/composer.test.ts`

- [ ] `Composer.create()` starts with an empty registry type.
- [ ] `register()` returns a composer whose type includes the newly registered key.
- [ ] Chained registrations preserve all keys and resolved return types.
- [ ] A later registration can use dependencies registered earlier in the chain.
- [ ] A factory does not assume that entries registered later are available to its dependency parameter.
- [ ] `compose()` exposes resolved values rather than factories or `Provider` instances.
- [ ] Valid direct-factory and configured-provider registrations are accepted.
- [ ] Malformed registrations are rejected.

### Priority 1 — composed container

Suggested file: `tests/types/composed-container.test.ts`

- [ ] Direct factory keys are public.
- [ ] Configured entries with `hidden: false` or no `hidden` flag are public.
- [ ] Configured entries with `hidden: true` are excluded from `keyof` the composed container.
- [ ] Public properties expose resolved values with the correct types.
- [ ] Public properties are readonly.
- [ ] An empty composer produces an empty public container type.
- [ ] An all-hidden registry produces no public provider keys.

### Priority 2 — dependency typing and negative cases

Suggested file: `tests/types/dependency-injection.test.ts`

- [ ] Verify the factory parameter is a readonly dependency container.
- [ ] Verify dependency values are inferred from the composer’s accumulated registry type.
- [ ] Verify a factory can access valid earlier dependencies without explicit annotations.
- [ ] Verify misspelled or unregistered dependencies are rejected when the current registration context does not contain them.
- [ ] Verify factory return types are inferred without explicit annotations.
- [ ] Document that dependency inference follows registration order rather than the final composed container type.

Suggested file: `tests/types/errors.test.ts`

- [ ] Accessing a hidden provider through the public composed container is rejected.
- [ ] Assigning to a public composed-container property is rejected.
- [ ] Assigning a resolved dependency to an incompatible type is rejected.
- [ ] Invalid registry entries are rejected.
- [ ] Use `@ts-expect-error` only for intentional API errors.

### Priority 3 — advanced supported types

- [ ] Test readonly and optional members in returned objects.
- [ ] Test unions and generic factory return values.
- [ ] Test unusual registry keys only if they are supported by both the object-spread runtime and public types.
- [ ] Add optional-provider tests only after optional providers are defined in the public API.

## Contract decisions to make before asserting

- [ ] Decide whether the unregistered-key sentinel is intentional public behavior or should become an error/`undefined` result.
- [ ] Decide whether singleton providers cache `null` and `undefined`.
- [ ] Decide whether duplicate keys replace earlier registrations or are rejected.
- [ ] Decide whether circular and self-dependencies need descriptive errors.
- [ ] Decide whether malformed registrations are validated at runtime.
- [ ] Decide which object keys and symbols are supported.

## Test infrastructure TODO

- [ ] Choose a runtime runner. Node's built-in test runner is the smallest dependency option; Vitest is an alternative.
- [ ] Add the selected runner or scripts to `package.json`.
- [ ] Replace the placeholder `npm test` script.
- [ ] Add a dedicated `tsconfig.tests.json` for unit and type tests without emitting library output.
- [ ] Add separate commands for runtime tests and type tests.
- [ ] Add coverage reporting after the core suite is stable.
- [ ] Add CI execution for both test categories.

## Suggested implementation order

1. Choose test infrastructure and create working runtime/type-test scripts.
2. Add `Composer`, `Container`, and `Provider` runtime tests.
3. Add `ResolvedProvider`, `ComposedContainer`, and fluent composer type tests.
4. Add hidden-provider and provider-configuration tests.
5. Add registration-order dependency typing tests.
6. Resolve contract decisions and add negative/edge-case tests.
7. Add integration coverage and then coverage reporting/CI enforcement.

Fastify tests should wait until `src/packages/fastify/` contains an implementation. Performance tests are unnecessary until the runtime contract and type API are stable.

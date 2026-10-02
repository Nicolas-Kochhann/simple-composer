# simple-composer

Simple, type-safe dependency composition for TypeScript. No decorators, no tokens, no reflection: just typed factories.

## Quick start

Chain `register()` calls, then call `compose()`. Each factory receives everything registered **before** it, fully typed.

```ts
import { Composer } from "simple-composer";

const container = Composer.create()
    .register({ config: () => ({ host: "localhost", port: 5432 }) })
    .register({ db: ({ config }) => new DB(config.host, config.port) })
    .register({ users: ({ db }) => new UserRepository(db) })
    .compose();

container.users; // UserRepository
```

- **Lazy**: a factory runs only when its property is read (directly or through another factory).
- **Immutable**: `register()` returns a new `Composer`; the original is untouched.
- **Typed**: the container type is inferred from your registrations.

## Registering entries

An entry is either a factory or a provider configuration.

```ts
.register({
    // Factory: transient, runs on every read
    id: () => crypto.randomUUID(),

    // Provider configuration
    db: {
        factory: ({ config }) => new DB(config.host),
        singleton: true, // default: false
        hidden: true     // default: false
    }
})
```

| Option      | Default | Effect |
|-------------|---------|--------|
| `factory`   | -       | Creates the value. Receives the dependency container (hidden entries included). |
| `singleton` | `false` | Runs the factory once and caches the result (including `undefined`, `null` and falsy values). |
| `hidden`    | `false` | Removes the entry from the type returned by `compose()`. Still injectable into other factories. **Type-level only**: it is still readable at runtime. |

## Scenarios

### Transient values (new on every read)

Plain factories are transient, which suits ids, timestamps and short-lived objects.

```ts
const container = Composer.create()
    .register({ requestId: () => crypto.randomUUID() })
    .compose();

container.requestId !== container.requestId; // true
```

### Shared services (singletons)

Use `singleton: true` for anything expensive or stateful: connection pools, loggers, caches.

```ts
const container = Composer.create()
    .register({ pool: { factory: () => new Pool(url), singleton: true } })
    .compose();

container.pool === container.pool; // true
```

### Private configuration (hidden)

Expose services, not their secrets.

```ts
const container = Composer.create()
    .register({ env: { factory: () => loadEnv(), hidden: true } })
    .register({ client: ({ env }) => new ApiClient(env.API_KEY) })
    .compose();

container.client; // ok
container.env;    // type error
```

### Layered architecture

Build up layers (config, infrastructure, domain, application) in order.

```ts
const app = Composer.create()
    .register({ config: () => loadConfig() })
    .register({ db: { factory: ({ config }) => new DB(config.dbUrl), singleton: true } })
    .register({ userRepo: ({ db }) => new UserRepository(db) })
    .register({ signup: ({ userRepo }) => new SignupService(userRepo) })
    .compose();
```

### Async dependencies

Factories may return promises. The container does not await them; with `singleton: true` the same promise is shared.

```ts
const container = Composer.create()
    .register({ db: { factory: () => connect(url), singleton: true } })
    .compose();

const db = await container.db; // connect() runs once
```

### Swapping implementations (tests, environments)

Registering an existing key replaces it (last one wins). Because resolution is lazy, anything that depends on the key picks up the replacement.

```ts
const base = Composer.create()
    .register({ mailer: () => new SmtpMailer() })
    .register({ signup: ({ mailer }) => new SignupService(mailer) });

const prod = base.compose();
const test = base.register({ mailer: () => new FakeMailer() }).compose();
```

Keep the replacement's type compatible with the original; the types of the old and new entry are intersected, not replaced.

### Functions as dependencies

Dependencies can be any value: functions, plain objects, primitives.

```ts
const container = Composer.create()
    .register({ now: () => () => Date.now() })
    .register({ greet: ({ now }) => (name: string) => `Hi ${name} at ${now()}` })
    .compose();

container.greet("Ana");
```

### Splitting registrations across modules

A `Composer` is a plain immutable value, so each module can extend one and hand it on.

```ts
// infra.ts
export const infra = Composer.create().register({ db: () => new DB() });

// domain.ts
export const domain = infra.register({ users: ({ db }) => new UserRepository(db) });

// main.ts
const container = domain.compose();
```

## Behavior and limits

- **Errors**: `compose()` throws `TypeError` if an entry is neither a function nor `{ factory }`. Errors thrown by a factory propagate unchanged, and a failed singleton is not cached.
- **Read-only**: assigning to a container property throws an `Error`.
- **Unregistered keys** read as `undefined`. Keys inherited from `Object.prototype` (such as `toString`) throw a `TypeError` unless you register them.
- **Circular dependencies** are not detected. They overflow the stack with a `RangeError`.
- **Order matters for types**: a factory only sees entries from earlier `register()` calls. Entries in the same call are not visible to each other in types (put dependent entries in a later `register()`).

## Types

- `Composer<T>`: the builder. `T` grows with each `register()`.
- `ComposedContainer<T>`: the result of `compose()`, with resolved values and hidden entries omitted.
- `Factory<TRegistry, TValue>`: `(container) => TValue`.

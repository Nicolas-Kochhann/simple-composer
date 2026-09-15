import { Factory } from "../provider/provider.js"
import { Provider } from "../provider/Provider.ts";

/** A registry of dependency factories or provider configurations. */
export type RegisterObject = { [key: string]: Registry | Factory };

/** Configuration for a dependency provider. */
export type Registry<T = unknown> = { factory: Factory<T>, singleton?: boolean, hidden?: boolean };

/** A provider paired with the registry key it belongs to. */
export type UncomposedProvider<T> = { key: string, provider: Provider }
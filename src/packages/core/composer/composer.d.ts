import { Factory } from "../provider/provider.js"
import { Provider } from "../provider/Provider.ts";

/** A registry of dependency factories or provider configurations. */
export type RegisterObject<T = any> = {
	[key: string]: Registry<T, unknown> | Factory<T, unknown>
};

/** Configuration for a dependency provider. */
export type Registry<TRegistry, TValue = unknown> = {
	factory: Factory<TRegistry, TValue>;
	singleton?: boolean;
	hidden?: boolean;
};

/** A provider paired with the registry key it belongs to. */
export type UncomposedProvider<T> = {
	key: string;
	provider: Provider<T, unknown>;
};
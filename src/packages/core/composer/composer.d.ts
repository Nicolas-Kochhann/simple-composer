import { Factory } from "../provider/provider.js"
import { Provider } from "../provider/Provider.ts";

/**
 * A registry of dependency factories or provider configurations, keyed by the
 * name each dependency is exposed under.
 *
 * Each value is either a {@link Factory} (transient) or a {@link Registry}
 * object for `singleton` / `hidden` control.
 */
export type RegisterObject<T = any> = {
	[key: string]: Registry<T, unknown> | Factory<T, unknown>
};

/**
 * Configuration for a dependency provider.
 *
 * @typeParam TRegistry The registry whose entries the factory can inject.
 * @typeParam TValue The value produced by the factory.
 */
export type Registry<TRegistry, TValue = unknown> = {
	/** Creates the dependency value. Receives the dependency container. */
	factory: Factory<TRegistry, TValue>;
	/**
	 * When `true`, the factory runs once and the value is cached.
	 * @defaultValue false
	 */
	singleton?: boolean;
	/**
	 * When `true`, the entry is omitted from the type returned by `compose()`
	 * but remains injectable into other factories. Type-level only: the value is
	 * still readable at runtime.
	 * @defaultValue false
	 */
	hidden?: boolean;
};

/**
 * A provider paired with the registry key it belongs to.
 *
 * @typeParam T The registry the provider belongs to.
 */
export type UncomposedProvider<T> = {
	key: string;
	provider: Provider<T, unknown>;
};
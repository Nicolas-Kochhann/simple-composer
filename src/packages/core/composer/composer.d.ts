import { Factory } from "../provider/provider.js"
import { Provider } from "../provider/Provider.ts";

export type RegisterObject = { [key: string]: Registry | Factory };
export type Registry<T = unknown> = { factory: Factory<T>, singleton: boolean, hidden: boolean };
export type UncomposedProvider<T> = { key: string, provider: Provider }
import { Factory } from "../provider/provider.js"

export type RegisterObject = { [key: string]: Registry | Factory };
export type Registry<T = unknown> = { factory: Factory<T>, singleton: boolean, hidden: boolean };
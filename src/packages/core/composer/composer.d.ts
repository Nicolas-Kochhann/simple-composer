import { Factory } from "../provider/provider.js"

export type RegisterObject = { [key: string]: Registry | Factory<T> };
export type Registry = { factory: Factory<T>, singleton: boolean };
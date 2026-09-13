import { ResolvedProvider } from "../provider/provider.js";

export type ComposedContainer<T> = {
    readonly [K in keyof T as T[K] extends { hidden: true } ? never : K]: ResolvedProvider<T[K]>
}
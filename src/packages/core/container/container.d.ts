import { ResolvedProvider } from "../provider/provider.js";

export type ComposedContainer<T> = {
    [K in keyof T]: ResolvedProvider<T[K]>
}
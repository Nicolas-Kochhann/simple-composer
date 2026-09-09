import { Container } from "../container/Container";

export type Factory = () => {};


export type Dependencies = Factory | Instance;
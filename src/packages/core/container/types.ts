import { Container } from "./Container"

const container = new Container();
export type Instance = InstanceType<typeof container.instances>
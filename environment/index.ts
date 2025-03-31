import { environment as dev } from "./environment.development";
import { environment as sandbox } from "./environment.sandbox";
import { environment as production } from "./environment.production";
import { DataInterface } from "./environment.types";

const env =
  process.env.NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV || "development";
export const data = [dev, sandbox, production];
export const envData = data.find((item) => item.name === env) ?? dev;
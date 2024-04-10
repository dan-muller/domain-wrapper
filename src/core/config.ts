import type { Parser } from "./utils/Parser";
import type { AnyMiddlewareFn } from "./middleware";
import type { AnyResolverFn } from "./builder";

export type Config<
  TConfig extends {
    context: unknown;
    input: unknown;
    output: unknown;
  },
> = {
  context: TConfig["context"];
  input: TConfig["input"];
  name?: string;
  output: TConfig["output"];
};

export type AnyConfig = Config<any>;

export type Definition<TConfig extends AnyConfig> = {
  // config: TConfig;
  input: Parser<TConfig["input"]>;
  output: Parser<TConfig["output"]>;
  middleware: AnyMiddlewareFn[];
  resolver: AnyResolverFn;
};

export type AnyDefinition = Definition<any>;

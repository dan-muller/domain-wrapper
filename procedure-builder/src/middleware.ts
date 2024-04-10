import { Merge, Promisable } from "type-fest";
import { AnyConfig } from "./config.js";
import type { Parser } from "./utils/Parser.js";
import { getUnknownError } from "./utils/Error.js";
import { AnyResolverFn } from "./builder.js";

export type MiddlewareOpts<TConfig extends AnyConfig> = {
  ctx: TConfig["context"];
  input: TConfig["input"];
  next: {
    (): Promisable<MiddlewareResult<TConfig>>;
    <$Context>(opts: { ctx: $Context }): Promisable<MiddlewareResult<Merge<TConfig, { context: $Context }>>>;
    <$Input>(opts: { input: $Input }): Promisable<MiddlewareResult<Merge<TConfig, { input: $Input }>>>;
  };
};
export type MiddlewareFn<TBase extends AnyConfig, TNext extends AnyConfig> = {
  (opts: MiddlewareOpts<TBase>): Promisable<MiddlewareResult<TNext>>;
  type?: "input" | "output" | "resolver";
};
export type AnyMiddlewareFn = MiddlewareFn<any, any>;

type MiddlewareSuccess<TConfig extends AnyConfig> = { ok: true; data: TConfig["output"] };
type MiddlewareError = { ok: false; error: unknown };
type MiddlewareResult<TConfig extends AnyConfig> = MiddlewareSuccess<TConfig> | MiddlewareError;
export type AnyMiddlewareResult = MiddlewareResult<any>;
export const createInputMiddleware = (input: Parser): AnyMiddlewareFn => {
  const middlewareFn = async ({ input: callInput, next }: MiddlewareOpts<any>) => {
    try {
      return await next({ input: input.parse(callInput) });
    } catch (error) {
      return { ok: false, error: getUnknownError(error) };
    }
  };
  middlewareFn.type = "input";
  return middlewareFn as AnyMiddlewareFn;
};
export const createOutputMiddleware = (output: Parser): AnyMiddlewareFn => {
  const middlewareFn = async ({ next }: MiddlewareOpts<any>) => {
    const result = await next();
    if (!result) throw new Error("No result. Did you forget to call `next`?");
    try {
      return result.ok ? { ok: true, data: output.parse(result.data) } : result;
    } catch (error) {
      return { ok: false, error: getUnknownError(error) };
    }
  };
  middlewareFn.type = "output";
  return middlewareFn as AnyMiddlewareFn;
};
export const createResolverMiddleware = <TConfig extends AnyConfig>(resolver: AnyResolverFn): AnyMiddlewareFn => {
  const middlewareFn = async ({ ctx, input }: MiddlewareOpts<TConfig>) => {
    try {
      return { ok: true, data: await resolver({ ctx, input }) };
    } catch (error) {
      return { ok: false, error: getUnknownError(error) };
    }
  };
  middlewareFn.type = "resolver";
  return middlewareFn as AnyMiddlewareFn;
};

import { AnyConfig, Definition } from "./config";
import { Promisable } from "type-fest";
import { ExtensionBuilder } from "./builder";
import type { AnyMiddlewareResult } from "./middleware";
import { getUnknownError } from "./utils/Error";
import { FunctionSignature } from "./utils/FunctionSignature";

export type ProcedureOpts<TConfig extends AnyConfig> = {
  ctx: TConfig["context"];
  input: TConfig["input"];
};
export type Procedure<TConfig extends AnyConfig> = {
  (opts: ProcedureOpts<TConfig>): Promisable<ProcedureResult<TConfig["output"]>>;
  def: Definition<TConfig>;
  extend: ExtensionBuilder<TConfig>;
};
export type AnyProcedure = Procedure<any>;

type ProcedureSuccess<TConfig extends AnyConfig> = { ok: true; data: TConfig["output"] };
type ProcedureError = { ok: false; error: unknown };
export type ProcedureResult<TConfig extends AnyConfig> = ProcedureSuccess<TConfig> | ProcedureError;
export type AnyProcedureResult = ProcedureResult<any>;

export type ProcedureCallOptions = { ctx: unknown; input: unknown };
export function createProcedureCaller<TConfig extends AnyConfig>(def: Definition<TConfig>) {
  const procedure = async (opts: ProcedureCallOptions) => {
    const callRecursive = async (callOpts: ProcedureCallOptions, index: number = 0): Promise<AnyMiddlewareResult> => {
      try {
        const middleware = def.middleware[index];
        return middleware({
          ctx: callOpts?.ctx ?? opts.ctx,
          input: callOpts?.input ?? opts.input,
          next: ((nextOpts: any) =>
            callRecursive(
              {
                ctx: nextOpts?.ctx ?? callOpts?.ctx ?? opts?.ctx,
                input: nextOpts?.input ?? callOpts?.input ?? opts?.input,
              },
              index + 1
            )) as any, // TODO: Fix this type
        });
      } catch (error) {
        return { ok: false, error: getUnknownError(error) };
      }
    };
    const result = await callRecursive(opts);
    if (!result) throw new Error("No result. Did you forget to call `next`?");
    return result;
  };
  procedure.def = def;
  return procedure satisfies FunctionSignature<AnyProcedure> & { def: Definition<TConfig> };
}

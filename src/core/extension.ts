import type { AnyConfig, Definition } from "./config";
import type { AnyProcedure, ProcedureCallOptions, ProcedureOpts, ProcedureResult } from "./procedure";
import type { Promisable } from "type-fest";
import type { FunctionSignature } from "./utils/FunctionSignature";

type ExtensionOpts<TConfig extends AnyConfig> = {
  ctx: TConfig["context"];
  def: Omit<Definition<TConfig>, "middleware" | "resolver">;
  input: TConfig["input"];
  next: () => Promisable<ProcedureResult<TConfig>>;
};
export type ExtensionFn<TBase extends AnyConfig, TOutput> = (
  opts: ExtensionOpts<TBase>
) => Promisable<ExtensionResult<TOutput>>;
export type AnyExtensionFn = ExtensionFn<any, any>;

export type ExtensionResult<TOutput> = TOutput;
export type AnyExtensionResult = ExtensionResult<any>;

export type ExtendedProcedure<TConfig extends AnyConfig, TOutput> = {
  (opts: ProcedureOpts<TConfig>): Promisable<TOutput>;
  def: Definition<TConfig>;
};
export type AnyExtendedProcedure = ExtendedProcedure<any, any>;

export const createExtensionCaller = <TConfig extends AnyConfig>(
  def: Definition<TConfig>,
  extension: AnyExtensionFn,
  procedure: FunctionSignature<AnyProcedure>
) => {
  const extendedProcedure = async (opts: ProcedureCallOptions) =>
    extension({
      ctx: opts.ctx,
      def: { input: def.input, output: def.output },
      input: opts.input,
      next: () => procedure(opts),
    });
  extendedProcedure.def = def;
  return extendedProcedure as AnyExtendedProcedure;
};

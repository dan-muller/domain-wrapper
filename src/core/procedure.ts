import type { AnyRootConfig } from "./internals/config";
import { ProcedureBuilder, ProcedureBuilderDef, ProcedureCallOptions } from "./internals/procedureBuilder";
import type { DefaultValue, Overwrite, UnsetMarker } from "./internals/utils";
import type { MiddlewareBuilder, MiddlewareFunction } from "./middleware";

type ClientContext = Record<string, unknown>;

/**
 * @internal
 */
export interface ProcedureOptions {
  /**
   * Client-side context
   */
  context?: ClientContext;
  signal?: AbortSignal;
}

/**
 * FIXME: this should only take 1 generic argument instead of a list
 * @internal
 */
export interface ProcedureParams<
  TConfig extends AnyRootConfig = AnyRootConfig,
  TContextOut = unknown,
  TInputIn = unknown,
  TInputOut = unknown,
  TOutputIn = unknown,
  TOutputOut = unknown,
> {
  _config: TConfig;
  /**
   * @internal
   */
  _ctx_out: TContextOut;
  /**
   * @internal
   */
  _input_in: TInputIn;
  /**
   * @internal
   */
  _input_out: TInputOut;
  /**
   * @internal
   */
  _output_in: TOutputIn;
  /**
   * @internal
   */
  _output_out: TOutputOut;
}

/**
 * @internal
 */
export type ProcedureArgs<TParams extends ProcedureParams> = TParams["_input_in"] extends UnsetMarker
  ? [input?: undefined | void, opts?: ProcedureOptions]
  : undefined extends TParams["_input_in"]
    ? [input?: TParams["_input_in"] | void, opts?: ProcedureOptions]
    : [input: TParams["_input_in"], opts?: ProcedureOptions];

type CreateProcedureReturnInput<TPrev extends ProcedureParams, TNext extends ProcedureParams> = ProcedureBuilder<{
  _config: TPrev["_config"];
  _ctx_out: Overwrite<TPrev["_ctx_out"], TNext["_ctx_out"]>;
  _input_in: TPrev["_input_in"];
  _input_out: UnsetMarker extends TNext["_input_out"]
    ? TPrev["_input_out"]
    : Overwrite<TPrev["_input_out"], TNext["_input_out"]>;
  _output_in: DefaultValue<TNext["_output_in"], TPrev["_output_in"]>;
  _output_out: DefaultValue<TNext["_output_out"], TPrev["_output_out"]>;
}>;

/**
 *
 * @internal
 */
export interface Procedure<TParams extends ProcedureParams> {
  _def: ProcedureBuilderDef<TParams> & TParams;
  // _procedure: true;
  /**
   * @internal
   */
  resolve: (opts: ProcedureCallOptions) => Promise<unknown>;
  /**
   * Add a middleware to the procedure.
   */
  use<$Params extends ProcedureParams>(
    fn: MiddlewareBuilder<TParams, $Params> | MiddlewareFunction<TParams, $Params>
  ): CreateProcedureReturnInput<TParams, $Params>;
}

export type AnyProcedure = Procedure<any>;

import type { AnyRootConfig } from "./internals/config";
import type { MiddlewareFunction } from "./middleware";
import type { ProcedureBuilderDef, ProcedureCallOptions } from "./internals/procedureBuilder";
import type { UnsetMarker } from "./internals/utils";

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

/**
 *
 * @internal
 */
export interface Procedure<TParams extends ProcedureParams> {
  _def: ProcedureBuilderDef<TParams> & TParams;
  _procedure: true;

  /**
   * @internal
   */
  (opts: ProcedureCallOptions<TParams>): Promise<TParams["_output_out"]>;

  /**
   * Add a plug-in to the procedure.
   */
  with<$Output>(
    fn: (...opts: Parameters<MiddlewareFunction<TParams, TParams>>) => Promise<$Output>
  ): (opts: ProcedureCallOptions<TParams>) => Promise<$Output>;
}

export type AnyProcedure = Procedure<any>;

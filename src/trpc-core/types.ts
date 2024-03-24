import type { AnyProcedure, ProcedureArgs } from "./procedure";

export const procedureTypes = ["query", "mutation", "subscription"] as const;
/**
 * @public
 */
export type ProcedureType = (typeof procedureTypes)[number];

export type inferHandlerInput<TProcedure extends AnyProcedure> = ProcedureArgs<inferProcedureParams<TProcedure>>;

export type inferProcedureInput<TProcedure extends AnyProcedure> = inferHandlerInput<TProcedure>[0];

export type inferProcedureParams<TProcedure> = TProcedure extends AnyProcedure ? TProcedure["_def"] : never;
export type inferProcedureOutput<TProcedure> = inferProcedureParams<TProcedure>["_output_out"];

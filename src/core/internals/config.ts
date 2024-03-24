import { ErrorFormatter, TRPCErrorShape } from "../error";

/**
 * The initial generics that are used in the init function
 * @internal
 */
export interface RootConfigTypes {
  ctx: object;
  errorShape: unknown;
}

/**
 * The default check to see if we're in a server
 */
export const isServerDefault: boolean =
  typeof window === "undefined" ||
  "Deno" in window ||
  globalThis.process?.env?.NODE_ENV === "test" ||
  !!globalThis.process?.env?.JEST_WORKER_ID ||
  !!globalThis.process?.env?.VITEST_WORKER_ID;

/**
 * The runtime config that are used and actually represents real values underneath
 * @internal
 */
export interface RuntimeConfig<TTypes extends RootConfigTypes> {
  /**
   * Use custom error formatting
   * @link https://trpc.io/docs/error-formatting
   */
  errorFormatter: ErrorFormatter<TTypes["ctx"], TRPCErrorShape<number> & { [key: string]: any }>;
  /**
   * Is this development?
   * Will be used to decide if the API should return stack traces
   * @default process.env.NODE_ENV !== 'production'
   */
  isDev: boolean;
}

/**
 * @internal
 */
export type CreateRootConfigTypes<TGenerics extends RootConfigTypes> = TGenerics;

/**
 * The config that is resolved after `initTRPC.create()` has been called
 * Combination of `InitTOptions` + `InitGenerics`
 * @internal
 */
export interface RootConfig<TGenerics extends RootConfigTypes> extends RuntimeConfig<TGenerics> {
  $types: TGenerics;
}

/**
 * @internal
 */
export type AnyRootConfig = RootConfig<{
  ctx: any;
  errorShape: any;
}>;

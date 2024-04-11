import type { AnyConfig, AnyDefinition, Definition } from "./config.js";
import type { FunctionSignature } from "./utils/FunctionSignature.js";
import type { Merge, Promisable } from "type-fest";
import type { MiddlewareFn } from "./middleware.js";
import type { Unset } from "./utils/Unset.js";
import type { inferParser, Parser } from "./utils/Parser.js";
import { createExtensionCaller, type ExtendedProcedure, type ExtensionFn } from "./extension.js";
import { createInputMiddleware, createOutputMiddleware, createResolverMiddleware } from "./middleware.js";
import { type AnyProcedure, createProcedureCaller, type Procedure } from "./procedure.js";

/**
 * @public
 *
 * @summary
 * A builder sub-type that defines the interface for adding a new input parser to a builder.
 *
 * @description
 * An `InputBuilder` is a function that takes a parser and returns a new builder with the given parser as the input parser.
 * The input parser is used to parse the input before passing it to the next middleware in the chain.
 */
export type InputBuilder<TConfig extends AnyConfig> = <$Input extends Parser>(
  input: $Input
) => Builder<Merge<TConfig, { input: inferParser<$Input> }>>;
export type AnyInputBuilder = InputBuilder<AnyConfig>;

/**
 * @public
 *
 * @summary
 * A builder sub-type that defines the interface for adding a new output parser to a builder.
 *
 * @description
 * An `OutputBuilder` is a function that takes a parser and returns a new builder with the given parser as the output parser.
 * The output parser is used to parse the output before returning it to the caller.
 */
export type OutputBuilder<TConfig extends AnyConfig> = <$Output extends Parser>(
  output: $Output
) => Builder<Merge<TConfig, { output: inferParser<$Output> }>>;
export type AnyOutputBuilder = OutputBuilder<AnyConfig>;

/**
 * @public
 *
 * @summary
 * A builder sub-type that defines the interface for adding a new middleware to a builder.
 *
 * @description
 * A `MiddlewareBuilder` is a function that takes a middleware function and returns a new builder with the given middleware
 * added to the chain. The middleware is used to transform the context, input, or output of the builder before passing it
 * to the next middleware in the chain.
 */
export type MiddlewareBuilder<TConfig extends AnyConfig> = <$Config extends AnyConfig>(
  middleware: FunctionSignature<MiddlewareFn<TConfig, $Config>>
) => Builder<$Config>;
export type AnyMiddlewareBuilder = MiddlewareBuilder<any>;

/**
 * @public
 *
 * @summary
 * A builder sub-type that defines the interface for adding a new resolver function to a builder.
 *
 * @description
 * A `ResolverBuilder` is a function that takes a resolver function and returns a new builder with the given resolver
 * function as the final middleware in the chain. The resolver is used to resolve the output of the builder.
 */
export type ResolverBuilder<TConfig extends AnyConfig> = <$Output>(
  resolver: ResolverFn<TConfig, $Output>
) => BuildProcedure<TConfig, $Output>;
export type AnyResolverBuilder = ResolverBuilder<any>;

export type ResolverOpts<TConfig extends AnyConfig> = { ctx: TConfig["context"]; input: TConfig["input"] };
export type ResolverFn<TConfig extends AnyConfig, $Output> = (opts: ResolverOpts<TConfig>) => Promisable<$Output>;
export type AnyResolverFn = ResolverFn<any, any>;

/**
 * @public
 *
 * @summary
 * Helps to define the type of the procedure that is built by the builder.
 *
 * @description
 * A `BuildProcedure` is a function that takes a configuration and returns a procedure. The procedure is used to execute
 * the builder with the given configuration. The configuration is used to set the context, input, and output of the builder.
 */
export type BuildProcedure<TConfig extends AnyConfig, TOutput> = Procedure<
  Unset extends TConfig["output"] ? Merge<TConfig, { output: TOutput }> : TConfig
>;

/**
 * @public
 *
 * @summary
 * A builder sub-type that defines the interface for adding a new extension to a procedure.
 *
 * @description
 * An `ExtensionBuilder` is a function that takes an extension function and returns an extended procedure. The extension
 * function is used to modify the behavior of the builder by adding new middleware or modifying existing middleware.
 */
export type ExtensionBuilder<TConfig extends AnyConfig> = <$Output>(
  extension: ExtensionFn<TConfig, $Output>
) => ExtendedProcedure<TConfig, $Output>;
export type AnyExtensionBuilder = ExtensionBuilder<any>;

export type Builder<TConfig extends AnyConfig> = {
  context: <$Context>() => Builder<Merge<TConfig, { context: $Context }>>;
  def: Definition<TConfig>;
  input: InputBuilder<TConfig>;
  output: OutputBuilder<TConfig>;
  resolve: ResolverBuilder<TConfig>;
  use: MiddlewareBuilder<TConfig>;
};
export type AnyBuilder = Builder<AnyConfig>;

//
// Implementation
//

/**
 * @public
 *
 * @summary
 * The `createBuilder` function is a utility function that creates a new builder with the given initial configuration.
 *
 * @desc
 * The `createBuilder` function takes an initial configuration and returns a new builder. The builder has several methods:
 * - `context`: Sets the context of the builder.
 * - `input`: Sets the input parser of the builder.
 * - `output`: Sets the output parser of the builder.
 * - `resolve`: Sets the resolver function of the builder.
 * - `use`: Adds a middleware to the builder.
 *
 * Each of these methods returns a new builder with the updated configuration.
 *
 * @example
 * ```typescript
 * const adder = createBuilder({}).context<{ add: number; sub: number }>()
 *    .use(({ ctx, next }) => next<{ mult?: number; add: number; sub: number }>({ ctx }))
 *    .input(z.number())
 *    .output(z.number())
 *    .resolve(({ ctx, input }) => ctx.add + input - ctx.sub)
 *
 * await adder({ ctx: { add: 1, sub: 2 }, input: 3 }); // 2
 *
 * const multer = adder.extend(async ({ ctx, next }) => {
 *   const result = await next();
 *   return result.ok ? (result.data * (ctx.mult ?? 1)).toString() : null;
 * });
 *
 * await multer({ ctx: { add: 1, sub: 2, mult: 4 }, input: 3 }); // 8
 * ```
 **/
export default function createBuilder(
  init: Partial<AnyDefinition>
): Builder<{ context: Unset; input: Unset; output: Unset }> {
  const def = { middleware: [], ...init } as AnyDefinition;
  return {
    def,
    context: () => createBuilder(def) as AnyBuilder,
    input: ((input) => createInputBuilder(def, input)) as AnyInputBuilder,
    output: ((output) => createOutputBuilder(def, output)) as AnyOutputBuilder,
    resolve: ((resolver) => createBuilderResolver(def, resolver)) as AnyResolverBuilder,
    use: ((middleware) => createNewBuilder(def, { middleware: [middleware] })) as AnyMiddlewareBuilder,
  } satisfies AnyBuilder;
}

/**
 * @private
 *
 * @summary
 * Creates a new builder by merging the configuration of two builders.
 *
 * @internal
 * The `createNewBuilder` function takes two definitions and merges them into a new definition. The new definition
 * takes properties from both definitions, with the second definition taking precedence over the first.
 */
function createNewBuilder<TConfig extends AnyConfig, TNext extends AnyConfig>(
  def1: Definition<TConfig>,
  def2: Partial<Definition<TNext>>
) {
  return createBuilder({
    input: def2.input ?? def1.input,
    output: def2.output ?? def1.output,
    middleware: [...def1.middleware, ...(def2.middleware ?? [])],
  }) satisfies AnyBuilder;
}

/**
 * @private
 *
 * @summary
 * Creates a new builder with the given input parser as a middleware.
 *
 * @internal
 * The `createInputBuilder` function creates a new builder with the given input parser as a middleware. The middleware
 * is used to parse the input before passing it to the next middleware in the chain. If an error occurs during parsing,
 * the middleware returns an error result. Otherwise, it returns the parsed input.
 */
function createInputBuilder<TConfig extends AnyConfig>(def: Definition<TConfig>, input: Parser) {
  return createNewBuilder(def, { input, middleware: [createInputMiddleware(input)] }) satisfies AnyBuilder;
}

/**
 * @private
 *
 * @summary
 * Creates a new builder with the given output parser as a middleware.
 *
 * @internal
 * The `createOutputBuilder` function creates a new builder with the given output parser as a middleware. The middleware
 * is used to parse the output before returning it to the caller. If an error occurs during parsing, the middleware
 * returns an error result. Otherwise, it returns the parsed output.
 */
function createOutputBuilder<TConfig extends AnyConfig>(def: Definition<TConfig>, output: Parser) {
  return createNewBuilder(def, { output, middleware: [createOutputMiddleware(output)] }) satisfies AnyBuilder;
}

/**
 * @private
 *
 * @summary
 * Creates a new builder with the given resolver function as a middleware.
 *
 * @internal
 * The `createBuilderResolver` function creates a new builder with the given resolver function as a middleware. The middleware
 * is used to resolve the output of the builder. If an error occurs during resolution, the middleware returns an error result.
 * Otherwise, it returns the resolved output. The middleware that is created is necessarily the last middleware in the chain.
 */
function createBuilderResolver<TConfig extends AnyConfig>(def: Definition<TConfig>, resolver: AnyResolverFn) {
  const finalBuilder = createNewBuilder(def, { resolver, middleware: [createResolverMiddleware(resolver)] });
  const procedure = createProcedureCaller(finalBuilder.def);
  const extend = ((extension) => createExtensionCaller(def, extension, procedure)) as AnyExtensionBuilder;
  return Object.assign(procedure, { extend }) satisfies AnyProcedure;
}

/**
 * @summary
 * The `Parser` type is a utility type that represents a parser object. A parser object has a `parse` method that takes an unknown input and returns a value of type `T`.
 *
 * @template T - The type of the value returned by the `parse` method. By default, `T` is `any`.
 *
 * @property {(input: unknown) => T} parse - A method that takes an unknown input and returns a value of type `T`.
 *
 * @example
 * ```typescript
 * // Example 1: A parser that parses an unknown input into a number
 * const numberParser = {
 *   parse: (input: unknown) => Number(input),
 * } satisfies Parser<number>;
 *
 * // Example 2: Using zod to create a parser that parses an unknown input into a string
 * const stringParser = z.string() satisfies Parser<string>;
 **/
export type Parser<T = any> = {
  parse: (input: unknown) => T;
};

/**
 * @summary
 * The inferParser type is a utility type that infers the return type of the parse method from a Parser type TParser.
 *
 * @template TParser - The Parser type from which to infer the return type of the parse method.
 *
 * @description
 * The inferParser type uses conditional types to infer the return type $T of the parse method from the Parser type TParser.
 * If TParser extends Parser<$T>, it results in $T.
 * Otherwise, it results in never.
 *
 * @example
 * ```typescript
 * // Example 1: Inferring the return type of the parse method from a Parser type
 * type Example1 = inferParser<Parser<number>>; // number
 * ```
 */
export type inferParser<TParser extends Parser> = TParser extends Parser<infer $T> ? $T : never;

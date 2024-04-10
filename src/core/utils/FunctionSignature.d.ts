/**
 * @summary
 * The `FunctionSignature` type is a utility type that captures the signature of a function type `T`.
 *
 * @template T - The function type whose signature is to be captured.
 *
 * @description
 * The `FunctionSignature` type uses conditional types to infer the parameter type `U` and return type `V` of the function type `T`.
 * If `T` is a function type, it captures its signature as `(opts: U) => V`.
 * If `T` is not a function type, it results in the `never` type.
 *
 * @example
 * ```typescript
 * // Example 1: Capturing the signature of a function that takes a number and returns a string
 * type Example1 = FunctionSignature<(opts: number) => string>; // (opts: number) => string
 *
 * // Example 2: Capturing the signature of a function that takes an object and returns a boolean
 * type Example2 = FunctionSignature<(opts: { a: number; b: string }) => boolean>; // (opts: { a: number; b: string }) => boolean
 *
 * // Example 3: Capturing the signature of a function that takes an object with a function signature and other properties
 * type Example3 = FunctionSignature<{
 *   (opts: { a: number; b: string }): boolean;
 *   name: string;
 *   count: number;
 * }>; // (opts: { a: number; b: string }) => boolean
 *
 * // Edge Case 1: When `T` is not a function type, the result is `never`
 * type EdgeCase1 = FunctionSignature<number>; // never
 * ```
 **/
export type FunctionSignature<T> = T extends (opts: infer U) => infer V ? (opts: U) => V : never;

// Example 1: Capturing the signature of a function that takes a number and returns a string
type Example1 = FunctionSignature<(opts: number) => string>; // (opts: number) => string

// Example 2: Capturing the signature of a function that takes an object and returns a boolean
type Example2 = FunctionSignature<(opts: { a: number; b: string }) => boolean>; // (opts: { a: number; b: string }) => boolean

// Example 3: Capturing the signature of a function that takes an object with a function signature and other properties
type Example3 = FunctionSignature<{
  (opts: { a: number; b: string }): boolean;
  name: string;
  count: number;
}>; // (opts: { a: number; b: string }) => boolean

// Edge Case 1: When `T` is not a function type, the result is `never`
type EdgeCase1 = FunctionSignature<number>; // never

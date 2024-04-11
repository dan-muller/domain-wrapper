/**
 * @summary
 * The `OmitValues` type is a utility type that creates a new type by omitting properties of a given type `T`
 * whose values extend a specified type `TValue`.
 *
 * @template T - The original type from which to omit properties.
 * @template TValue - The type of the values to be omitted from the original type.
 *
 * @description
 * The `OmitValues` type uses a mapped type over the keys of `T` (`K in keyof T`).
 * For each key, it checks if the corresponding value type in `T` extends `TValue`.
 * If it does, the key is omitted (using the `never` type).
 * If it doesn't, the original key-value pair is preserved in the new type.
 *
 * @example
 * ```typescript
 * type Example1 = OmitValues<{ a: number; b: string; c: boolean }, number>; // { b: string; c: boolean; }
 * type Example2 = OmitValues<{ a: number; b: string; c: boolean }, string | number>; // { c: boolean; }
 * type Example3 = OmitValues<{ a: number; b: undefined; c: null }, null | undefined>; // { a: number; }
 *
 * // Edge Case 1: When `T` is an empty object, the result is also an empty object regardless of `TValue`
 * type EdgeCase1 = OmitValues<{}, number>; // {}
 * // Edge Case 2: When `TValue` is `never`, no properties are omitted
 * type EdgeCase2 = OmitValues<{ a: number; b: string; c: boolean }, never>; // { a: number; b: string; c: boolean; }
 * // Edge Case 3: When `TValue` is `unknown`, all properties are omitted
 * type EdgeCase3 = OmitValues<{ a: number; b: string; c: boolean }, unknown>; // {}
 * ```
 **/
export type OmitValues<T, TValue> = { [K in keyof T as T[K] extends TValue ? never : K]: T[K] };
